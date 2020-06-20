const getCodeBlock = (text, startFlug, endFlug) => {
    let block = text;
    let initialMatchIndex = -1;
    let totalMatchedIndex = 0;
    let currentIndex = -1;

    var counter = {
        startFlug: 0,
        endFlug: 0,
    };

    const matcherPattern = new RegExp(`${startFlug}|${endFlug}`);
    const startFlugMatch = new RegExp(startFlug);
    let result = matcherPattern.exec(block);
    while (result) {
        if (startFlugMatch.test(result[0])) {
            if (initialMatchIndex < 0) {
                initialMatchIndex = result.index;
            }
            counter.startFlug++;
        } else {
            counter.endFlug++;
        }

        currentIndex = result.index + result[0].length;
        totalMatchedIndex += currentIndex;
        if (counter.startFlug == counter.endFlug) {
            return {
                startIndex: initialMatchIndex,
                matched: text.substring(initialMatchIndex, totalMatchedIndex),
                endIndex: totalMatchedIndex,
            };
        }
        block = block.substring(currentIndex);
        result = matcherPattern.exec(block);
    }
    return null;
};



module.exports = {
    getCodeBlock,
}