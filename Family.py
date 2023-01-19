from math import sqrt
from numpy import ndenumerate
from scipy.linalg import dft, hadamard


class Family:
    @staticmethod
    def get(dim, fam="dft"):
        family = {
            "hadamard" : lambda n : ndenumerate((1 / sqrt(n) * hadamard(n, dtype=complex))),
            "dft" : lambda n : ndenumerate(1 / sqrt(n) * dft(n))
        }

        it = family[fam](dim)
        out = [{
            "val_real": round(val[1].real, 2),
            "val_imag": round(val[1].imag, 2)
        } for val in it]

        return out
