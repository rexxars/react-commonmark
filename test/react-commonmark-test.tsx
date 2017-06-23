import * as ReactCommonmark from '../';

const text = "# Hello";

const ex1: JSX.Element = (
    <ReactCommonmark source={text} />
);

const allowedTypes: ReactCommonmark.NodeType[] = ['BlockQuote', 'Code'];

const ex2: JSX.Element = (
    <ReactCommonmark
        source={text}
        allowedTypes={allowedTypes}
    />
);
