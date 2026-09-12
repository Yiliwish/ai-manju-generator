# Use Alibaba Cloud's domestic base image and Node.js mirror so the build
# never needs to contact Docker Hub.
FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/alinux3:latest

ENV NODE_VERSION=20.20.0
ENV PATH=/opt/node/bin:$PATH

WORKDIR /app

RUN set -eux; \
    if command -v yum >/dev/null 2>&1; then \
      yum install -y ca-certificates curl tar xz gzip; \
    else \
      dnf install -y ca-certificates curl tar xz gzip; \
    fi; \
    curl -fsSL "https://mirrors.aliyun.com/nodejs-release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
      -o /tmp/node.tar.xz; \
    mkdir -p /opt/node; \
    tar -xJf /tmp/node.tar.xz -C /opt/node --strip-components=1; \
    rm -f /tmp/node.tar.xz; \
    node --version; \
    npm --version; \
    npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
