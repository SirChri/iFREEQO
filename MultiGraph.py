import json
import networkx as nx
import numpy

class NumpyArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

class MultiGraph: 
    #constructor for 
    def __init__(self):
        pass

    def from_dot(self, dot_graph):
        self.graph = nx.MultiDiGraph(dot_graph)

    def from_json(self, json_text):
        graph_from_json = json.loads(json_text)
        edges = graph_from_json["edges"]
        nodes = graph_from_json["nodes"]

        self.graph = nx.MultiDiGraph()
        self.graph.add_nodes_from(nodes)
        self.graph.add_edges_from(edges)

    def edges(self):
        return self.graph.edges()

    def nodes(self):
        return self.graph.nodes()

    # eulerify utils
    def in_degree(self, node):
        return self.graph.in_degree(node)

    def out_degree(self, node):
        return self.graph.out_degree(node)

    def balance(self, node):
        return self.out_degree(node) - self.in_degree(node)

    # algo 3
    def eulerify(self):
        B_plus = [u for u in self.nodes() if self.balance(u) > 0]
        B_minus = [u for u in self.nodes() if self.balance(u) < 0]
        first = 0

        for u in B_minus:
            while self.balance(u) < 0:
                v = B_plus[first]
                self.graph.add_edge(u, v)

                if self.balance(v) == 0:
                    first += 1

    # convert graph to line graph
    def to_line_graph(self):
        self.graph = nx.line_graph(self.graph)

    def to_numpy_array(self):
        return nx.to_numpy_array(self.graph, nonedge=None)

    def to_json_array(self):
        return json.dumps(self.to_numpy_array(), cls=NumpyArrayEncoder)

    def serialize(self):
        return {
            "matrix": self.to_json_array(),
            "nodes": list(self.nodes()),
            "edges": list(self.edges())
        }