module.exports = {
    convertToDOT
}

function convertToDOT (source, parent){
    let dot_result = "'digraph { lines[label=\"$1\"];".replace("$1", parent);
 
    for (var i = 0; i < source.length; i ++){
        dot_result += "lines -- $1[label=\"$2\", color=\"black\"];".replace("$1",source[i].childSObject).replace("$2",source[i].field);
    }
    dot_result += "}'"
    return dot_result
}