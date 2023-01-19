# iFREEQO
Interactive Failure-Resilient Eulerian graph Encoding (for) Quantum tOurs. \\
Based on [FREEQO](https://github.com/RiccardoRomanello/FREEQO).\\
![iFREEQO app](docs/ifreeqo-screen.png?raw=true "iFREEQO app")

## How to run it
### Docker
You can run iFREEQO directly inside a docker container by:
```sh
docker build -t "ifreeqo" -f ./Dockerfile .
docker run -d -it -p 80:8080 --name=ifreeqo ifreeqo
```

By default the docker image exposes the port 8080 where the web server (flask) is started. Using `-p 80:8080` we are redirecting the traffic on port 80 on our local computer.\\
The application will then be available at `http://localhost`.


### Manual 
You can also start the application manually. All you have to do is:
```sh
\# compile client app
cd client
npm install && npm run build
cd -

\# start webserver
pip install -r requirements.txt
flask --app Main.py run --port 8080 --host 0.0.0.0
```

The application will then be available at `http://localhost:8080`.