var parseDate = (str) => {
    return new Date(parseInt(str.replace('/Date(', '')));
};

module.exports = {
    data: []
};
