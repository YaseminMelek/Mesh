import Fingerpose from 'fingerpose';
// gesture definitions with fingerpose libraries
export const outstretchedhand = new Fingerpose.GestureDescription("outstretched_hand");
outstretchedhand.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.NoCurl, 1.0);
outstretchedhand.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.NoCurl, 1.0);
//outstretchedhand.addDirection(Fingerpose.Finger.Index, Fingerpose.FingerDirection.VerticalUp, 1.0);
outstretchedhand.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
//outstretchedhand.addDirection(Fingerpose.Finger.Middle, Fingerpose.FingerDirection.VerticalUp, 1.0);
outstretchedhand.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.NoCurl, 1.0);
//outstretchedhand.addDirection(Fingerpose.Finger.Ring, Fingerpose.FingerDirection.VerticalUp, 1.0);
outstretchedhand.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.NoCurl, 1.0);

export const fist = new Fingerpose.GestureDescription("fist");
fist.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.FullCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.FullCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.FullCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.FullCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.FullCurl, 0.9);

fist.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.HalfCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.HalfCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.HalfCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.HalfCurl, 0.9);
fist.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.HalfCurl, 0.9);

export const pickGesture = new Fingerpose.GestureDescription("pick gesture");
pickGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.HalfCurl, 1.0);
pickGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.NoCurl, 0.5);
pickGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.HalfCurl, 1.0);
pickGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.NoCurl, 0.5); 
[Fingerpose.Finger.Middle, Fingerpose.Finger.Ring, Fingerpose.Finger.Pinky].forEach((finger) => {
    pickGesture.addCurl(finger, Fingerpose.FingerCurl.FullCurl, 1.0);
});

//pickingGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 1.0);
//pickingGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);

export const DownwardGesture = new Fingerpose.GestureDescription('downward');
// Palm facing downward (use z-coordinates)
DownwardGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.NoCurl, 1.0);
DownwardGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.NoCurl, 1.0);
DownwardGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
DownwardGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.NoCurl, 1.0);
DownwardGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.NoCurl, 1.0);

// Define specific directions (downward)
DownwardGesture.addDirection(Fingerpose.Finger.Thumb, 'verticalDown', 1.0);
DownwardGesture.addDirection(Fingerpose.Finger.Index, 'verticalDown', 1.0);
DownwardGesture.addDirection(Fingerpose.Finger.Middle, 'verticalDown', 1.0);
DownwardGesture.addDirection(Fingerpose.Finger.Ring, 'verticalDown', 1.0);
DownwardGesture.addDirection(Fingerpose.Finger.Pinky, 'verticalDown', 1.0);
