import zeek from "./src/zeek.ts";

const Z = new zeek();
Z.runInput("console", "\"Hello, World!\"");

