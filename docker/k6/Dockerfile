FROM alpine:3.16

ARG K6_VERSION=v0.39.0

RUN apk add --no-cache ca-certificates \
    && rm -rf /var/cache/apk/* \
    && adduser -D -u 12345 -g 12345 k6 

COPY k6 /usr/bin/k6

USER 12345
WORKDIR /home/k6
ENTRYPOINT ["k6"]