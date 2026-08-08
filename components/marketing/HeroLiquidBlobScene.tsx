'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface BlobProps {
  color:         string
  emissive:      string
  position:      [number, number, number]
  scale:         [number, number, number]
  initRotation:  [number, number, number]
  distort:       number
  speed:         number
  timeOffset:    number
}

function Blob({ color, emissive, position, scale, initRotation, distort, speed, timeOffset }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + timeOffset
    if (!meshRef.current) return
    meshRef.current.rotation.x = initRotation[0] + t * 0.022
    meshRef.current.rotation.y = initRotation[1] + t * 0.031
    meshRef.current.rotation.z = initRotation[2] + t * 0.014
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 48, 48]} />
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.32}
        distort={distort}
        speed={speed}
        roughness={0.18}
        metalness={0}
      />
    </mesh>
  )
}

export function HeroLiquidBlobScene() {
  const wrapperRef          = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.05 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 70 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Bright ambient so the baked colour of each blob reads clearly */}
        <ambientLight intensity={1.0} />
        {/* Directional fill for subtle surface shaping */}
        <directionalLight position={[4, 6, 3]}  intensity={0.7} />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color="#ffd8b0" />

        <Suspense fallback={null}>
          {/*
           * Blob layout (fov 70, camera z=5 → visible ≈ ±3.5 wide × ±2.1 tall at z=0):
           * Each blob is a sphere scaled to an elongated ellipsoid, positioned so the
           * distorted surface bleeds off the respective canvas edge.
           *
           * Orange cluster — upper / upper-right
           * Violet cluster — lower / lower-right
           * Overlap in the mid-zone reads as a warm→cool gradient.
           */}

          {/* [A] Large amber — bleeds top-left and left edges */}
          <Blob
            color="#e84e18"
            emissive="#b83010"
            position={[-1.6, 1.2, 0]}
            scale={[2.8, 3.8, 1.8]}
            initRotation={[0, 0, 0.3]}
            distort={0.65}
            speed={0.7}
            timeOffset={0}
          />

          {/* [B] Burnt-orange — bleeds top and right edges */}
          <Blob
            color="#c03818"
            emissive="#982808"
            position={[2.2, 1.8, -0.6]}
            scale={[2.0, 2.8, 1.5]}
            initRotation={[0.2, 0, -0.4]}
            distort={0.70}
            speed={0.85}
            timeOffset={2.5}
          />

          {/* [C] Deep violet — bleeds bottom edge and spreads center */}
          <Blob
            color="#5020b0"
            emissive="#2810a0"
            position={[0.4, -2.4, 0.5]}
            scale={[3.4, 2.2, 2.0]}
            initRotation={[-0.3, 0, 0.4]}
            distort={0.65}
            speed={0.65}
            timeOffset={1.5}
          />

          {/* [D] Indigo — bleeds right and bottom-right */}
          <Blob
            color="#301898"
            emissive="#180870"
            position={[3.2, -0.8, 0]}
            scale={[2.0, 3.0, 1.4]}
            initRotation={[0, 0, 0.6]}
            distort={0.70}
            speed={0.75}
            timeOffset={4.0}
          />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
