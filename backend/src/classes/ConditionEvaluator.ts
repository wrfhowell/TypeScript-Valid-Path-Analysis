import * as ts from "typescript";
import {SyntaxKind} from "typescript";
import { CustomContext } from "./CustomContext";
import {init} from "z3-solver";

const WARNING = true;

const warn = (...args: any[]) => {
    if (WARNING) {
        console.warn(...args);
    }
};


export class ConditionEvaluator {
    z3Context;
    pathParams: { [id: string]: any } = {};
    jumpTable: any;
    constructor(pathParams: { [id: string]: any }) {
        this.pathParams = pathParams;
        this.jumpTable = {
            [SyntaxKind.Identifier]: this.visitIdentifier,
            [SyntaxKind.BinaryExpression]: this.visitBinaryExpression,
            [SyntaxKind.NonNullExpression]: this.visitNonNullExpression,
            [SyntaxKind.BarBarToken]: this.visitBarBarToken,
            [SyntaxKind.AmpersandAmpersandToken]: this.visitAmpersandAmpersandToken,
            [SyntaxKind.LessThanToken]: this.visitLessThanToken,
            [SyntaxKind.LessThanEqualsToken]: this.visitLessThanEqualsToken,
            [SyntaxKind.GreaterThanToken]: this.visitGreaterThanToken,
            [SyntaxKind.EqualsGreaterThanToken]: this.visitEqualsGreaterThanToken,
            [SyntaxKind.EqualsEqualsToken]: this.visitEqualsEqualsToken,
        };

    }

    init = async() => {
        const { Context } = await init();
        this.z3Context = Context("main");
    }

    visitCondition(context: CustomContext, node: ts.Expression) {
        if (Object.prototype.hasOwnProperty.call(this.jumpTable, node.kind)) {
            const visitFn = this.jumpTable[node.kind];
            return visitFn(context, node);
        } else {
            warn(
                "found an unspecified condition: ",
                node.getText(),
                ", ",
                ts.SyntaxKind[node.kind]
            );
        }
    }

    visitIdentifier(context: CustomContext, node: ts.Identifier) {
        console.log("Got identifier: ", node.getText());
        return this.pathParams[node.getText().toString()];
    }

    visitBinaryExpression(context: CustomContext, node: ts.BinaryExpression) {
        console.log("Found a binary expression: ", node.getText());
        if (Object.prototype.hasOwnProperty.call(this.jumpTable, node.operatorToken.kind)) {
            const visitFn = this.jumpTable[node.operatorToken.kind];
            return visitFn(context, node.left, node.operatorToken, node.right);
        } else {
            warn(
                "found an unspecified operator: ",
                node.operatorToken.getText(),
                ", ",
                ts.SyntaxKind[node.kind]
            );
        }

    }

    visitNonNullExpression(context: CustomContext, node: ts.NonNullExpression) {
        console.log("Got non null expression ", node.expression.getText());
    }


    visitBarBarToken(context: CustomContext, node: ts.Node) {
        console.log("Got bar bar token ", node.getText());

    }

    visitAmpersandAmpersandToken(context: CustomContext, node: ts.Node) {
        console.log("Got ampersand ampersand token ", node.getText());

    }

    visitGreaterThanToken(context: CustomContext, leftNode: ts.Identifier,
                          operatorNode: ts.Node,
                          rightNode: ts.Identifier) {
        console.log("Got greater than token ", operatorNode.getText());
        return this.z3Context.GT(this.visitIdentifier(context, leftNode),
            this.visitIdentifier(context, rightNode));

    }

    visitEqualsGreaterThanToken(context: CustomContext, leftNode: ts.Identifier,
                                operatorNode: ts.EqualsGreaterThanToken,
                                rightNode: ts.Identifier) {
        console.log("Got greater than equals token ", operatorNode.getText());
        return this.z3Context.GE(this.visitIdentifier(context, leftNode),
            this.visitIdentifier(context, rightNode));
    }

    visitLessThanToken(context: CustomContext, leftNode: ts.Identifier,
                       operatorNode: ts.Node,
                       rightNode: ts.Identifier) {
        console.log("Got less than token ", operatorNode.getText());
        return this.z3Context.LT(this.visitIdentifier(context, leftNode),
            this.visitIdentifier(context, rightNode));

    }

    visitLessThanEqualsToken(context: CustomContext, leftNode: ts.Identifier,
                             operatorNode: ts.Node,
                             rightNode: ts.Identifier) {
        console.log("Got less than equals token ", operatorNode.getText());
        return this.z3Context.LE(this.visitIdentifier(context, leftNode),
            this.visitIdentifier(context, rightNode));

    }

    visitEqualsEqualsToken(context: CustomContext, leftNode: ts.Identifier,
                           operatorNode: ts.Node,
                           rightNode: ts.Identifier) {
        console.log("Got equals equals token ", operatorNode.getText());
        return this.z3Context.Eq(this.visitIdentifier(context, leftNode),
            this.visitIdentifier(context, rightNode));


    }

    visitNotEqualsToken(context: CustomContext, node: ts.Node) {
        console.log("Got not equals token ", node.getText());

    }
}