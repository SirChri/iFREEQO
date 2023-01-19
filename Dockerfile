FROM python:slim as build
LABEL name="Interactive FREEQO"
LABEL version="1.0"
LABEL description="An interactive webapp to play with FREEQO"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

#INSTALLS
RUN apt-get update && \
    apt-get install -y --no-install-recommends nodejs npm musl-dev g++

# copy files
COPY client /opt/dist/client
COPY requirements.txt /opt/dist/
COPY *.py /opt/dist/

WORKDIR /opt/dist/client
RUN rm -rf node_modules package-lock.json
RUN (npm install && npm rebuild node-sass && npm run build) & \
    (pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r ../requirements.txt) ; \
    wait


# Slim Rebuild
FROM python:slim
LABEL name="Interactive FREEQO"
LABEL version="1.0"
LABEL description="An interactive webapp to play with FREEQO"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENV API_PORT 8080
EXPOSE $API_PORT

WORKDIR /opt/dist

COPY --from=build /wheels /wheels
COPY --from=build /opt/dist/client /opt/dist/client
COPY --from=build /opt/dist/*.py ./
COPY --from=build /opt/dist/requirements.txt .
COPY --from=build /opt/dist/static /opt/dist/static

RUN pip install --no-cache /wheels/*

CMD flask --app Main.py run --port $API_PORT --host 0.0.0.0