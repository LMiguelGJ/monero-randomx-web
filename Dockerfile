# syntax=docker/dockerfile:1.7
# RandomX bonanza — multi-stage container.
# Etapa 1: compila el motor RandomX a WASM con Emscripten.
# Etapa 2: runtime mínimo en Node.js, solo con los artefactos finales.
#
# Build:   docker build -t monero-randomx-web:latest .
# Run:     docker compose up -d --build
# Logs:    docker compose logs -f randomx

# ─── Etapa 1: builder ───────────────────────────────────────────────────────
FROM emscripten/emsdk:3.1.64 AS builder
WORKDIR /src

# La imagen emsdk ya trae emcc, clang, binaryen y nodejs. Solo necesitamos
# make para que build.sh pueda orquestar la compilación. Versión pinneada
# para builds reproducibles (DL3008).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        make \
 && rm -rf /var/lib/apt/lists/*

# Copiamos solo lo necesario para compilar el motor. .dockerignore evita que
# los artefactos previos de public/ entren al contexto.
COPY wasm/ /src/wasm/

# build.sh escribe los .js/.wasm finales en /src/public/.
RUN mkdir -p /src/public \
 && chmod +x /src/wasm/build.sh \
 && /src/wasm/build.sh

# ─── Etapa 2: runtime ──────────────────────────────────────────────────────
# node:20.18.0-alpine — pinneado para reproducibilidad (DL3066).
FROM node:20.18.0-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    WS_PORT=8080 \
    STRATUM_TCP_PORT=3333

# Dependencias del proyecto (vendored, no hay npm install).
COPY package.json ./
COPY vendor/    ./vendor/

# Proxy y configuración.
COPY proxy/     ./proxy/
COPY config.js  ./config.js

# Recursos estáticos servidos por el proxy (HTML/JS/CSS/fuentes).
COPY public/    ./public/

# Artefactos compilados del motor — sobrescriben los placeholders que pueda
# haber dejado un build previo en el contexto.
COPY --from=builder /src/public/randomx.js      ./public/
COPY --from=builder /src/public/randomx.wasm    ./public/
COPY --from=builder /src/public/randomx_st.js   ./public/
COPY --from=builder /src/public/randomx_st.wasm ./public/

EXPOSE 8080 3333

# Healthcheck HTTP al puerto web. El proxy ya reporta problemas al pool en
# sus logs; este check evita un contenedor zombie si el proceso muere.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://127.0.0.1:'+process.env.WS_PORT+'/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]

# node:20-alpine incluye el usuario no privilege "node" (uid 1000).
USER node

CMD ["node", "proxy/index.js"]
