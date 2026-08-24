/**
 * Vote-X WebGL Background Shader
 * Renders electric purple energy waves on a deep navy background.
 */

function initShaderBackground(canvasId = 'shader-canvas-ANIMATION_4') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  function syncSize() {
    const parent = canvas.parentElement || document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
    new ResizeObserver(syncSize).observe(canvas.parentElement);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    
    // Create a deep navy to black gradient base (#0A0C1B)
    vec3 color1 = vec3(0.039, 0.047, 0.106); 
    vec3 color2 = vec3(0.015, 0.015, 0.04);
    
    // Moving electric purple blobs and cyber grid wave
    float noise1 = sin(uv.x * 3.2 + u_time * 0.45) * cos(uv.y * 2.1 - u_time * 0.35);
    float noise2 = sin(uv.y * 4.0 + u_time * 0.25) * cos(uv.x * 2.6 + u_time * 0.38);
    
    vec3 electricPurple = vec3(0.486, 0.227, 0.929); // #7C3AED
    vec3 deepCyan = vec3(0.12, 0.55, 0.95);
    
    float glow = smoothstep(0.25, 0.85, noise1 * noise2 + 0.52);
    vec3 finalColor = mix(color1, color2, uv.y);
    finalColor = mix(finalColor, electricPurple, glow * 0.38);
    finalColor = mix(finalColor, deepCyan, sin(uv.x * 5.0 + u_time * 0.2) * 0.06);
    
    // Soft subtle vignette
    float dist = distance(uv, vec2(0.5));
    finalColor *= smoothstep(1.0, 0.25, dist);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  let animFrameId;
  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrameId = requestAnimationFrame(render);
  }

  animFrameId = requestAnimationFrame(render);

  return () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  };
}

window.initShaderBackground = initShaderBackground;
