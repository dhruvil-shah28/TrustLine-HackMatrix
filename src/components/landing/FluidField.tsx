'use client';

import React, { useEffect, useRef, useState } from 'react';

// Static SVG fallback for reduced-motion
const StaticSVG = () => (
  <svg className="w-full h-full absolute inset-0 text-[#1F5C45] opacity-20" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d="M0,20 Q25,30 50,20 T100,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M0,40 Q25,50 50,40 T100,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M0,60 Q25,70 50,60 T100,60" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M0,80 Q25,90 50,80 T100,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

const vsSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  
  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * (u_resolution.xy / min(u_resolution.x, u_resolution.y));
    
    // Mouse interaction - gentle bulge
    float dist = distance(vUv, u_mouse);
    float influence = smoothstep(0.3, 0.0, dist);
    uv += normalize(vUv - u_mouse + 0.001) * influence * 0.08;

    // Domain warp
    float f = snoise(uv * 1.5 + u_time * 0.02) * 1.5;
    f += snoise(uv * 3.0 - u_time * 0.03) * 0.5;
    f += snoise(uv * 6.0 + u_time * 0.01) * 0.25;

    // Isoline rendering
    float lines = 8.0; 
    float v = f * lines;
    float lineThickness = 0.06;
    float aa = 0.04;
    float distIso = abs(fract(v) - 0.5);
    float contour = smoothstep(lineThickness + aa, lineThickness, distIso);

    // Fade edges
    float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * 
                     smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

    // Colors: Forest #1F5C45 and Sage #8EAD9B
    vec3 c1 = vec3(0.12, 0.36, 0.27); // Forest
    vec3 c2 = vec3(0.55, 0.68, 0.61); // Sage
    vec3 color = mix(c2, c1, smoothstep(-0.5, 0.5, snoise(uv * 2.0)));
    
    float alpha = contour * 0.25 * edgeFade; 
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function FluidField({ variant = 'behind' }: { variant?: 'behind' | 'inside-letters' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const cb = window.requestIdleCallback || setTimeout;
    cb(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted || isReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Only init if > 768px (for performance optimization) or we can just run it always 
    // with simplified params, but let's run it.
    const isMobile = window.innerWidth < 768;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, vsSource);
    const frag = compileShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    if (!program || !vert || !frag) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const locPos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    const locTime = gl.getUniformLocation(program, 'u_time');
    const locRes = gl.getUniformLocation(program, 'u_resolution');
    const locMouse = gl.getUniformLocation(program, 'u_mouse');

    let raf: number;
    let time = 0;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const handleMouse = (e: MouseEvent) => {
      if (isMobile) return;
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1.0 - (e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouse);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25); // cap DPR
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locRes, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    let isVisible = true;
    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(canvas);

    const draw = () => {
      if (isVisible && document.visibilityState === 'visible') {
        time += 0.5;
        gl.uniform1f(locTime, time);

        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        gl.uniform2f(locMouse, mouse.x, 1.0 - mouse.y); // invert Y back for tracking visually

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      observer.disconnect();
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
    };
  }, [mounted, isReducedMotion]);

  if (isReducedMotion) {
    return <StaticSVG />;
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      {variant === 'inside-letters' && (
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <mask id="trustline-mask" x="0" y="0" width="100%" height="100%" maskUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="black" />
              <text x="50%" y="50%" fill="white" textAnchor="middle" dominantBaseline="middle"
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 'max(15vw, 60px)',
                  fontWeight: 800,
                  letterSpacing: '0.01em',
                }}
              >
                TRUSTLINE
              </text>
            </mask>
          </defs>
        </svg>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 1,
          WebkitMaskImage: variant === 'inside-letters'
            ? 'none'
            : 'radial-gradient(ellipse at 30% 40%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,1) 40%)',
          mask: variant === 'inside-letters'
            ? 'url(#trustline-mask)'
            : 'radial-gradient(ellipse at 30% 40%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,1) 40%)',
        }}
      />
    </>
  );
}
