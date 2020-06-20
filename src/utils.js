const trim = require('lodash/trim');

//TODO: Implment File Tree  Inclusion
//TODO: Expressions
//TODO: If Else Lader
//TODO: ForEach
//TODO: Transformation or Piping

const text = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Test</title>
</head>
<body>
    {{@include('/template/b.html')}}
   <b> {{ a - 2 }} <a/>

    <p>Result = {{ a + 10 }} and Roll  </p>

{{@include('/template/c.html')}}


{{@forEach(users)}}
<h1>Hello world</h1>
amar sonar bangla

{{@endForEach}}

<h1> Kemon aco tumi</h1>

{{@forEach(players as player)}}
<h1>Name: {{player.name}}</h1>
<h1>Age: {{player.age}}</h1>
<h1>ID: {{index}}</h1>
{{@endForEach}}

{{
    @if(a == 5)
    }}
        <h2> I am here because He is honest </h1>
    {{
    @elseIf(a==3)
    }}
    
    {{@if(name == 'rahul')}}
        <h2> May Is Rahul </h1>
    {{@endIf}}

    

        <h2> I am here because He is honest and a is 3 </h1>
    {{@elseIf(a==6)}}
        <h2> I am here because He is honest </h1>
    {{@else}}
        <h1>Nothing Matched</h1>
    {{@endIf}}



    {{@if(4==4)}}
        <h2> Four is always 4 </h1>
    {{@else}}
        <h1>Nothing found</h1>
    {{@endIf}}
   
</body>


</html>
`;

const templateB = `
<h2> Hello , I am template B</h2>
`;
var a = 3;
var users = [1, 2, 3];
const data = {
    users: [1, 2, 3, 4, 5],
    players: [
        { name: 'Rahul', age: 29 },
        { name: 'Ripan', age: 30 },
        { name: 'baruri', age: 30 },
    ],
    name: 'rahul',
    a: 5,
};

const macroRegex = /\{\{@\S+\}\}/g; //{{@include("./index.html")}}, {{@if(name == 'rahul')}}
const expressionRegex = /(?:\{\{)([^@{}]+)(?:\}\})/; //{{age+5}}
const filePathRegex = /(?:\'|\")+([^"']\S+)(?:\'|\")/; // ./index.html
const includeStatementRegex = /^\{\{@include\((\'|\"){1,1}([^"']\S)+(\'|\"){1,1}\)\}\}$/; //{{@include("./index.html")}}
const forEachRegex = /(\{\{@forEach\((([$\w]+)\s+as\s+([$\w]+))\)\}\})([^\{\{@\}\}](\s|(?!endForEach|forEach).)+)(\{\{@endForEach\}\})/;
const blockRegex = /(?:@block\{\{)((\s|(?!block|end).)+)(?:\}\}@end)/i;
const elseIfLaderRegex = /(\{\{\s*@(if|elseIf|else)(\((.+)\))?\s*\}\})((\s|(?!@if|@elseIf|@else|@endIf).)+)(\{\{\s*@(elseIf|else|endIf)(\((.+)\))?\s*\}\})/;

const reservedKeyWords = [
    'if',
    'elseif',
    'endif',
    'forEach',
    'endForEach',
    'include',
];

const BLOCK = {
    PREFIX: '@block{{',
    SUFFIX: '}}@end',
};

const IF_BLOCK = {
    PREFIX: '@IfStart{{',
    SUFFIX: '}}@IfEnd',
};

const tempalteMapping = {};

const getAllTemplateSyntaxes = (content) => {
    return content.match(macroRegex);
};

const getAllForEachSyntaxes = (content) => {
    return forEachRegex.exec(content);
};

const getIncludeStatements = (statements) =>
    statements.filter((statement) => includeStatementRegex.test(statement));

const getExpressions = (content) => content.match(expressionRegex);

const prepareValidExpression = (expression, context) => {
    const statement = `with(context) {${expression};}`;
    return eval(statement);
};

const parseTemplate = (content) => {
    const statements = getAllTemplateSyntaxes(content);
    const expressions = getExpressions(content);
    return {
        statements,
        expressions,
    };
};

const processInclution = (content, statements) => {
    let tempalte = content;
    const filesToBeIncluded = getIncludeStatements(statements);
    filesToBeIncluded.forEach((statement) => {
        tempalte = tempalte.replace(statement, templateB);
    });
    return tempalte;
};

const processExpression = (content, context) => {
    let template = content;
    let matched = expressionRegex.exec(template);
    while (matched) {
        const evaluated = prepareValidExpression(matched[1], context);
        template = template.replace(matched[0], evaluated);
        matched = expressionRegex.exec(template);
    }
    return template;
};

const processBlockExpression = (content) => {
    let template = content;
    let matched = blockRegex.exec(template);
    while (matched) {
        const loopBlock = prepareValidExpression(matched[1], data);
        template = template.replace(matched[0], loopBlock);
        matched = blockRegex.exec(template);
    }
    return template;
};

const processIfElseLader = () => {};

const getCodeBock = (text, startFlug, endFlug) => {
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

const processIterations = (content) => {
    let template = content;
    let matched = forEachRegex.exec(template);
    while (matched) {
        const loopBlock = `@block{{Array.prototype.reduce.call(${matched[3]}, (acc, item, index) => acc+processExpression(\`${matched[5]}\`,{index:index, ${matched[4]}: item}), '');}}@end`;
        template = template.replace(matched[0], loopBlock);
        matched = forEachRegex.exec(template);
    }
    return template;
};

const processElseIfLader = (content) => {
    let template = content;
    let matched = elseIfLaderRegex.exec(template);
    const identifiers = {
        if: 'if',
        elseif: 'else if',
        else: 'else',
    };
    while (matched) {
        let condition = matched[2] === 'if' ? IF_BLOCK.PREFIX : '';
        const cases = ['else', 'elseif', 'if'];
        if (cases.includes(matched[2].toLowerCase())) {
            if (matched[4]) {
                const closer = !matched[7].includes('@endIf')
                    ? matched[7]
                    : `\n${IF_BLOCK.SUFFIX}`;

                condition += `${identifiers[matched[2].toLowerCase()]}(${
                    matched[4]
                }) {
                    template += \`${matched[5]}\`;
                 } ${closer}`;
            } else {
                condition = `${matched[2].toLowerCase()} {
          template += \`${matched[5]}\`;
                }\n${IF_BLOCK.SUFFIX}`;
            }
        } else {
            console.log('Not matched');
        }

        template = template.replace(matched[0], condition);
        matched = elseIfLaderRegex.exec(template);
    }
    return template;
};

const evaluateIfElseStatement = (expressionIndex, context) => {
    let template = '';
    const globalContext = Object.assign({}, data, context);
    with (globalContext) {
        eval(tempalteMapping[expressionIndex]);
    }
    return template;
};
const getToBeParsed = (text) => {
    let tobeParsed = trim(text, IF_BLOCK.PREFIX);
    return trim(tobeParsed, IF_BLOCK.SUFFIX);
};

const parseIfElseLader = (content) => {
    let blockIndex = 0;
    let result = getCodeBock(
        content,
        `${IF_BLOCK.PREFIX}if\\(`,
        IF_BLOCK.SUFFIX,
    );
    const processedIfElseStack = [
        {
            index: `__NESTED_BLOCK_` + blockIndex,
            block: getToBeParsed(result.matched),
            params: {},
        },
    ];

    const initialBlock = result && result.matched ? result.matched : '';

    while (result && result.matched) {
        const innerCheck = getCodeBock(
            getToBeParsed(result.matched), // no matched found then recent pushed or previous
            `${IF_BLOCK.PREFIX}if\\(`,
            IF_BLOCK.SUFFIX,
        );

        if (!innerCheck) {
            break;
        }

        if (innerCheck.matched) {
            const nestedBlock = '__NESTED_BLOCK_' + ++blockIndex;
            const ifElseParse = `\${evaluateIfElseStatement('${nestedBlock}', {})}`;
            processedIfElseStack.push({
                index: nestedBlock,
                block: getToBeParsed(innerCheck.matched),
                params: {},
            });
            const parentIndex = processedIfElseStack.length - 2;
            const parentElement = processedIfElseStack[parentIndex];
            const updatedParentBlock = parentElement.block.replace(
                innerCheck.matched,
                ifElseParse,
            );
            processedIfElseStack[parentIndex].block = updatedParentBlock;
            result = innerCheck;
        }
    }
    processedIfElseStack.forEach(({ index, block }) => {
        tempalteMapping[index] = block;
    });
    let template = '';
    eval(processedIfElseStack[0].block);
    return content.replace(initialBlock, template);
};

const processAllIfElse = (content) => {
    let template = content;
    let parsed = getCodeBock(
        template,
        `${IF_BLOCK.PREFIX}if\\(`,
        IF_BLOCK.SUFFIX,
    );
    let i = 0;
    while (parsed) {
        template = parseIfElseLader(template);
        parsed = getCodeBock(
            template,
            `${IF_BLOCK.PREFIX}if\\(`,
            IF_BLOCK.SUFFIX,
        );
    }

    return template;
};

const exprotToTarget = () => {};
const processTemplate = () => {
    const { statements } = parseTemplate(text);
    let content = processInclution(text, statements);
    const forEachExpressions = getAllForEachSyntaxes(content);
    //ontent = processIterations(content);
    content = processElseIfLader(content);
    const parsedAllIfElse = processAllIfElse(content);
    console.log(parsedAllIfElse);

    //content = processExpression(content,data);
    //content = processIfElseLader(content);
    //export to dist;
    process.exit();
};

processTemplate();
