enum Operations {
    op_add, 
    op_subtract, 
    op_ascii_value // cut + value
}

enum MoveInstructions {
    moveXPlus, 
    moveXMinus,
    moveYPlus,
    moveYMinus
}

enum InterpretResult {
    interpret_ok,
    interpret_error
}

export {Operations}
