// casey conchinha - @kcconch ( https://github.com/kcconch )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/
// original adam ferriss example: https://github.com/aferriss/p5jsShaderExamples/tree/gh-pages/4_image-effects/4-16_video-feedback

precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform sampler2D tex0;
uniform sampler2D tex1;

uniform vec2 u_mouse;
uniform float mouseDown;
uniform float time;

vec3 rgb2hsb(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  // uv.y = 1.0 - uv.y;
  uv = vec2(1.0,1.0) - uv;  

  // make a copy of the uvs
  vec2 feedbackUv =  uv;

  // move the uv space between -1 and 1
  feedbackUv = uv * 2.0 - 1.0;

  // scale the uvs up just a tad for a feedback zoom
  feedbackUv *= u_mouse.x;

  // return the uvs to 0 - 1 range
  feedbackUv = feedbackUv * 0.5 + 0.5;

  // get the webcam
  vec4 cam = texture2D(tex0, uv);

  // make a copy of the camera
  vec4 tex = cam ;
  
  // if the mouse isn't clicked we'll run the feedback loop
  if(mouseDown == 0.0){

    // calculate an angle from the hue
    // we will use these to offset the texture coordinates just a little bit
    vec3 hsb = rgb2hsb(cam.rgb);
    float angleX =  cos(hsb.r*TWO_PI);
    float angleY = sin(hsb.r * TWO_PI);
    
    feedbackUv.x = 1.0 - feedbackUv.x;
    // add those angles to the tex coords and sample the feed back texture
    tex = texture2D(tex1, feedbackUv + vec2(angleX, angleY)*0.001);

    // add some camera from the screen
    tex.rgb += cam.rgb * 0.87;

    // if tex.r > 1.0, invert the texture and swizzle the color channels around
    tex.r = mix(tex.r, 1.0 - tex.r, step(0.9, tex.r) );
    tex.g = mix(tex.r, 1.0 / tex.g, step(0.9, tex.g) );
    tex.b = mix(tex.r, 1.0 / tex.b, step(0.9, tex.b) );
    
    tex.rgb = hsb2rgb(tex.rgb + hsb.bgr);
    
    // tex.rgb = 1.0 - tex.rgb;
    // tex /= 2.0;

  } 
  
  // render the output
  gl_FragColor = tex;
}