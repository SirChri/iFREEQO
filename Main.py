import logging
import MultiGraph as mg
import networkx as nx
import pydot
from flask import Flask, render_template, request, url_for, jsonify
import Family
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_url_path="/static")
CORS(app)

app.logger.setLevel(logging.INFO)

@app.route('/')
def static_file():
    return app.send_static_file('index.html')

@app.route('/line-graph', methods=['POST'])
def linegraph():
    input_dot = request.get_data(cache=True, as_text=True)
    P_list = pydot.graph_from_dot_data(input_dot)

    # Convert only the first such instance into a NetworkX graph.
    graph = mg.MultiGraph()
    graph.from_dot(nx.nx_pydot.from_pydot(P_list[0]))
    graph.eulerify()
    graph.to_line_graph()

    return graph.serialize()

@app.route('/matrix', methods=['GET'])
def getmatrix():
    t = request.args.get('type')
    n = int(request.args.get('n'))
    data = Family.Family.get(n, t)

    return {
        "data": data
    }

if __name__ == '__main__':
    app.run()