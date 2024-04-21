# Zeeklang (WIP)

zeek lang is made to be an easy to use interpreted language (and just something im using to learn more about programming langguages)

## how to use

you can modify the source in the `./main.ts` file and run the source string using `deno task dev`

although if you wish to run a file like the example `main.zl` file. i suggest to build the project first by doing `deno task complieWin` and then it will compile as `zeek.exe` in the bin in the main directory. once done i suggest adding it to you enviroment variable config and you can just use:

```bash
zeek run main.zl
```

here is the full clone and build commands

```bash
git clone https://github.com/lilBluDev/zeeklang.git
cd zeeklang
Deno task compileWin
zeek help
```

## Planed Syntax

```text
import "std"; // import with the varname of the package

//  to port a package from the project directory it must start with a "./"
// but if a directory is ended with a "/" than the interpreter will automaticly pick a "main" package from that directory
import (
    "./foo/",
    "./dir/bar"
);

//  staticly types mutable variable
var hw: str = "hello, world!";
var port: int = 3141;

//  exported dynamicly typed variable
pub var dyn := "how dynamic!";

//  staticly typed  constant varriable
const pi: float = 3.141;
const exist: bool = true;

//  enum creation
enum PlayerState {
    Idle, // 0
    InBattle //  1
}

//  create a structure
struct Vec2 {
    int x,
    int y
}

struct Player {
    PlayerState state,
    int hp,
    Vec2 pos
}

// creating a structure
var player: Player = Player {
    hp: 10,
    state: PlayerState.Idle,
    pos: Vec2 {
        x: 3,
        y: 10
    }
}

//  creating an array
var arr: []int = [ 69, 420 ];

//  multitypes are supported
var arr2: [](int, str) = [ 1, "hello" ];

// when ever a function from a package is being used it must be pulled with the : op
std:print(hw);

var print := std:print;

//  functions are created like the following
//  and a return type has to be given
//  if the return type is not a void than it has to return the assigned type
//  the returned value is the last evaluated value of the block
fn add(int x, int y) -> int {
    x + y;
}

//  just like in zig, calculated values from funtions can be returned into the blok with if statements
if (add(10, 5)) |z| {
    //  and just like in javascript, strings are formated with the ` string
    print(`calculated val: {z}`);
}

print(`generated player: {player}`);
```

## TODO's

(✅) - Done <Br>
(🚧) - In Progress <Br>
(❌) - Not Started <Br>

- Tokenizer (lexer) [✅]
- Parser [🚧] (current stage of development, testing stage)
  - Binary Operation [✅]
  - Unary (prefix) Operation [✅]
  - Assignment [✅]
  - Variable Declaration [✅]
  - Function Declaration [✅]
  - Struct Declaration [✅]
  - Enum Declaration [✅]
  - import Statement [✅]
  - pub Statement [✅]
  - Member Op [✅]
  - Call Op [✅]
  - If Statement [✅]
  - For loops [✅]
  - While loops [✅]
  - Array and Struct Creation [✅]
  - package export pulling [✅]
- Interpreter [❌]

## List Of Known Issues

None
