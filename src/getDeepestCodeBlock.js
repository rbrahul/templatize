const trim = require('lodash/trim');

const {getCodeBlock} = require('./getCodeBlock');

const getTrimedBlock = (text, start, end) => {
    text = trim(text, start.replace('\+',''));
    text = trim(text,end.replace('\+',''));
    console.log(text);
    return text;
}


module.exports = (text, startFlag, endFlag) => {
    let codeBlock = getCodeBlock(text, startFlag, endFlag);
    while(codeBlock) {
        const newBlock = getTrimedBlock(codeBlock.matched, startFlag, endFlag);
       const result = getCodeBlock(newBlock, startFlag, endFlag);
        if(!result){
            break;
        }
        codeBlock = result;
    }
    return codeBlock;
}
