// 為了避免一直寫document.getElementById
exports.$ = (id) => {
    return document.getElementById(id);
}