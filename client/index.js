import { Toast, Popover } from 'bootstrap'
import $ from 'jquery';
import './scss/app.scss';

$(function () {
    var graph = null;

    var toastEl = document.getElementById('main-toast')
    var toast = Toast.getOrCreateInstance(toastEl)

    const updateToastMsg = (text) => {
        $(toastEl).find(".toast-body").html(text);
    }

    /**
     * convert matrix 1s to their relative incident node
     */
    const preprocessMatrix = () => {
        if (!graph)
            return;

        var matrix = graph.matrix;
        const nodes = graph.nodes;

        for (let row = 0; row < matrix.length; row++) {
            const nodeRow = nodes[row];

            for (let col = 0; col < matrix[row].length; col++) {
                const nodeCol = nodes[col];

                if (matrix[row][col] == null)
                    continue;

                graph.matrix[row][col] = nodeRow[1];
                graph.matrixdim = graph.matrixdim || {};
                graph.matrixdim[nodeRow[1]] = (graph.matrixdim[nodeRow[1]] || 0) + 1; //how many nodes with same key information
            }
        }
    }

    /**
     * get html grid and put it into #output-matrix
     */
    const generateGrid = () => {
        if (!graph)
            return

        const n = graph.nodes.length + 1;
        const matrix = graph.matrix;
        let count = 0;

        let grid = "<div class='solgrid' style='grid-template-rows: repeat(" + n + ", 1fr); grid-template-columns: repeat(" + n + ", 1fr);'>";

        for (let row = -1; row < matrix.length; row++) {
            if (row == -1) {
                grid += `<div class='first-col-header'></div>`;
                for (const i in graph.nodes)
                    grid += `<div class='col-header'>${graph.nodes[i]}</div>`;

                continue;
            }

            for (let col = -1; col < matrix[row].length; col++) {
                // in first column put the node names
                if (col == -1) {
                    grid += `<div class='row-header'>${graph.nodes[count++]}</div>`;
                    continue;
                }

                let hasVal = matrix[row][col] != null;
                let cnt = hasVal ? `1` : "0"
                let selectable = hasVal ? ` selectable` : ""
                let popover = hasVal ? `data-bs-toggle="popover" data-bs-trigger="focus" tabindex=0` : "";
                let matrixdim = hasVal ? `data-matrixdim="${Math.sqrt(graph.matrixdim[matrix[row][col]])}"` : ""; //matrix dimension

                grid += `
                    <div style="
                        background-color: ${stringToColorCode(matrix[row][col])}; 
                        color: ${textColorOnHEXBg(stringToColorCode(matrix[row][col]))}" 
                    class='cell${selectable}' 
                    data-row='${row}' 
                    data-col='${col}' 
                    data-original-content="${cnt}" 
                    data-original-node="${matrix[row][col]}"
                    ${matrixdim}
                    ${popover}>
                        ${cnt}
                    </div>`;
            }
        }

        grid += "</div>"

        $("#output-matrix").empty();
        $("#output-matrix").append(grid);

        function applyMatrix(matrix, val) {

            var currMatrix = [].slice.call(document.querySelectorAll(`[data-original-node="${val}"]`));
            const maxCol = Math.max(...currMatrix.map(c => c.dataset.col));

            currMatrix.sort(function(a, b) { 
                let aRow = Number(a.dataset.row),
                    aCol = Number(a.dataset.col),
                    bRow = Number(b.dataset.row),
                    bCol = Number(b.dataset.col)

                return (aRow * maxCol + aCol) - (bRow * maxCol + bCol);
            })

            matrix.forEach(function (value, i) {
                $(currMatrix[i]).html(`${value.val_real}${value.val_imag >= 0 ? "+"+value.val_imag : value.val_imag}j`)
            });
        }

        //create popover
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))

        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            var data = popoverTriggerEl.dataset;

            return new Popover(popoverTriggerEl, {
                html: true,
                content: function () {
                    let body = $("<div>");
                    let dft = $('<button type="button" class="btn btn-secondary">DFT</button>');

                    dft.on("click", function (t) {
                        $.ajax({
                            type: "GET",
                            url: "/matrix",
                            data: {
                                type: 'dft',
                                n: data.matrixdim
                            },
                            success: function (res, textStatus, jqXHR) {
                                applyMatrix(res.data, data.originalNode);
                            }
                        });
                    })

                    body.append(dft)

                    //if matrix is a pow of 2
                    if ((Math.log(data.matrixdim) / Math.log(2)) % 1 === 0) {
                        let hadamard = $('<button type="button" class="btn btn-secondary">Hadamard</button>');

                        hadamard.on("click", function() {
                            $.ajax({
                                type: "GET",
                                url: "/matrix",
                                data: {
                                    type: 'hadamard',
                                    n: data.matrixdim
                                },
                                success: function (res, textStatus, jqXHR) {
                                    applyMatrix(res.data, data.originalNode);
                                }
                            });
                        })
                        body.append(hadamard)
                    }

                    return body;
                },
                title: function () {
                    var title = $(this).attr("data-popover-content");
                    return $(title).children(".popover-heading").html();
                }
            })
        });
    }

    $("#formFile").on('change', function (f) {
        const file = $("#formFile").prop('files')[0];

        var reader = new FileReader();

        reader.onload = function (e) {
            var content = reader.result;
            //Here the content has been read successfuly
            $("#dot-src").val(content);
        }

        reader.readAsText(file);
    });

    $("#input").on("submit", function (event) {
        $.ajax({
            type: "POST",
            url: "/line-graph",
            data: $("#dot-src").val(),
            success: function (data, textStatus, jqXHR) {
                graph = JSON.parse(data);
                graph.matrix = JSON.parse(graph.matrix);

                updateToastMsg("Graph successfully loaded.")
                toast.show()

                clearColorCodes();
                preprocessMatrix();
                generateGrid();
            },
            dataType: "text"
        });
        event.preventDefault();
    });

    /**
     * UTILITIES
     */
    var color_codes = {};
    function stringToColorCode(str) {
        if (str == null)
            return "#FFFFFF";

        return (str in color_codes) ? color_codes[str] : (color_codes[str] = '#' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6));
    }

    const clearColorCodes = () => {
        color_codes = {};
    }

    const hexToRgb = function (hex) {
        if (!hex)
            return null;

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const textColorOnHEXBg = function (hex) {
        const rgb = hexToRgb(hex);
        if (!rgb)
            return undefined;

        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? "#000000" : "#ffffff";
    }
});
