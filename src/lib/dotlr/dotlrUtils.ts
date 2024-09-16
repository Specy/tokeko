import {
    stringifyAction,
    stringifyActionVerbose,
    stringifyAtom,
    stringifyItem,
    stringifyLookahead,
    stringifyRule,
    stringifyToken,
    stringifyTreeStack,
} from "@specy/dotlr/utils";
import type {GrammarError, ParserError, ParsingError, Token} from "@specy/dotlr/types";

export function stringifyGrammarError(e: GrammarError) {
    if (e.type === "UnexpectedToken") {
        return `Unexpected token, expected one of:\n${e.value.expected.map(maybeToken).join(', ')}`
    } else if (e.type === "UnexpectedEof") {
        return `Unexpected end of input, expected one of:\n${e.value.expected.map(maybeToken).join(', ')}`
    } else if (e.type === 'InvalidRegex') {
        return `Invalid regular expression\n${e.value.regex}`
    }
    return "Unknown error"
}

function maybeToken(token: Token|string){
    return typeof token === 'string' ? token : stringifyToken(token)
}

export function stringifyParsingError(error: ParsingError){
    if (error.type === "UnexpectedEof") {
        return `Unexpected end of input, expected one of:\n${error.value.expected.map(maybeToken).join(", ")}`
    } else if (error.type === 'UnknownToken') {
        return `Unknown token: ${error.value.token}`
    } else if (error.type === "UnexpectedToken") {
        return `Unexpected token, expected one of:\n${error.value.expected.map(maybeToken).join(', ')}`
    }
    return "Unknown error"
}

export function stringifyParserError(error: ParserError){
    if(error.type === "EmptyGrammar") return "Empty grammar"
    if(error.type === "UndefinedSymbol") return `Undefined symbol: ${error.value.symbol}`
    if(error.type === "UndefinedRegexToken") return `Undefined regex token: ${error.value.regex_token}`
    if(error.type === "Conflict") return `Conflict in state ${error.state} on token ${error.token}`
    return "Unknown error"
}

export function stringifyError(error: GrammarError | ParsingError | ParserError){
    const s = stringifyGrammarError(error as GrammarError)
    const s2 = stringifyParsingError(error as ParsingError)
    const s3 = stringifyParserError(error as ParserError)
    console.log(s, s2, s3)
    if([s, s2, s3].every(s => s === "Unknown error")) return "Unknown error"
    if(s !== "Unknown error") return s
    if(s2 !== "Unknown error") return s2
    return s3
}

export {
    stringifyAction,
    stringifyAtom,
    stringifyItem,
    stringifyLookahead,
    stringifyRule,
    stringifyToken,
    stringifyActionVerbose,
    stringifyTreeStack
}