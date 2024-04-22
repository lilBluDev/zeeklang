import chalk from "chalk";

// Error Example:
//           ┌── (path) [line:col] <errtype>
// [line num]| [line preview]
//           └── errExplenation

export function BasicNHErr(err: string) {
    console.log("❗|", err);
}

export function detailedErr(path: string, line: number, preview: string, col: number, errtype: string, errExplenation: string): void {
    console.log(ConnectedLinePath(path, line, col, errtype));
    console.log(linePreview(line, preview));
    console.log(ErrArrow(line, col));
    console.log(ConnectedErrExplenation(line, errExplenation));
}

export function ConnectedLinePath(path: string, line: number, col: number, errtype: string): string {
    return " ".repeat(`${line}`.length)+` ┌── (${chalk.grey(path)}) [${line}:${col}] ${chalk.red(errtype)}`;
}

export function linePreview(line: number, lineprev: string): string {
    return `${chalk.blue(line)} | ${lineprev}`;
}

export function ErrArrow(line: number, col: number): string {
    return " ".repeat(`${line}`.length)+` ├${chalk.grey("~".repeat(col))}${chalk.red("^")}`;
}

export function ConnectedErrExplenation(line: number, errExplenation: string): string {
    return " ".repeat(`${line}`.length)+` └── ${errExplenation}`;
}