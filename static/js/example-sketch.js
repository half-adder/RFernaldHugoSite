// in this sketch we're going to create a feedback effect by repeatedly sending the same image back to the shader and performing a slight modification
// click the mouse to get things started

// the shader variable
let camShader;

// the camera variable
let cam;

// we will need at least two layers for this effect
let shaderLayer;
let copyLayer;

function preload() {
    // load the shader
    camShader = loadShader('/shaders/shader.vert', '/shaders/shader.frag');
}

function setup() {
    // disables scaling for retina screens which can create inconsistent scaling between displays
    pixelDensity(1);

    // shaders require WEBGL mode to work
    var canvas = createCanvas(400, 400);
    canvas.parent('content-div');
    noStroke();

    // initialize the webcam at the window size
    cam = createCapture(VIDEO);
    cam.size(400, 400);

    // hide the html element that createCapture adds to the screen
    cam.hide();

    // this layer will use webgl with our shader
    shaderLayer = createGraphics(400, 400, WEBGL);

    // this layer will just be a copy of what we just did with the shader
    copyLayer = createGraphics(400, 400);

}

function draw() {
    // shader() sets the active shader with our shader

    shaderLayer.shader(camShader);

    // lets just send the cam to our shader as a uniform
    camShader.setUniform('tex0', cam);

    // also send the copy layer to the shader as a uniform
    camShader.setUniform('tex1', copyLayer);

    // send mouseIsPressed to the shader as a int (either 0 or 1)
    camShader.setUniform('mouseDown', int(mouseIsPressed));
    camShader.setUniform("u_mouse", [map(mouseX, 0, width, 0.5, 1.1), map(mouseY, 0, height, height, 0) / height]);

    camShader.setUniform('time', frameCount * 0.01);

    // rect gives us some geometry on the screen
    shaderLayer.rect(0, 0, width, height);

    // draw the shaderlayer into the copy layer
    copyLayer.image(shaderLayer, 0, 0, width, height);

    // render the shaderlayer to the screen
    image(shaderLayer, 0, 0, width, height);

    textSize(24);
    text("Click.", 50, 50);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}