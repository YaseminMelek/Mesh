type StackItem = string | number

export default class Stack  {
    private storage: StackItem[] = [];

    constructor(private capacity: number = Infinity) {}
    push(item: StackItem): void {
        if (this.size() === this.capacity) {
          throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
      }
    
      pop(): StackItem | undefined {
        return this.storage.pop();
      }
    
      peek(): StackItem | undefined {
        return this.storage[this.size() - 1];
      }
    
      size(): number {
        return this.storage.length;
      }

}
