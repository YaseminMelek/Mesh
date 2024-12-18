Instructions and Rules

![alt text](https://github.com/YaseminMelek/Mesh/blob/main/instructions.png)

Bugs
1) There are bugs with the interpreter with some move sequences if popped. For instance with sequences involving different axes (move x+ , move y- , pop), the interpreter doesn't print the values correctly. If the sequences are in the same axis (move y-, move y+, pop), the operations work.

2) The duplicate function is not completed. The shortcut for it is 3 on the keyboard. 

3) The key and mouse interactions don't work if the hand detection is activated. 


AI usage

I used Chat GPT for debugging for understanding and implementing the initial hand detection libraries, Tensorflow and Fingerpose. I also used during debugging when integrating the hand detection and the UI to Solid.js. 