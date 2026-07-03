'use client'

import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'



/* ─────────────────────────────────────────────
   Central planet — "Sentiquant"
───────────────────────────────────────────── */
function CentralPlanet({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const cloudRef = useRef<THREE.Mesh>(null)

  const surfaceTex = useLoader(THREE.TextureLoader, '/textures/sentiquant-planet-surface.jpg')
  const cloudTex   = useLoader(THREE.TextureLoader, '/textures/sentiquant-planet-clouds.png')

  useEffect(() => {
    surfaceTex.colorSpace = THREE.SRGBColorSpace
    surfaceTex.wrapS      = THREE.RepeatWrapping
    surfaceTex.anisotropy = 8
    cloudTex.wrapS        = THREE.RepeatWrapping
  }, [surfaceTex, cloudTex])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
      groupRef.current.rotation.z = Math.sin(t * 0.15) * 0.03
      groupRef.current.position.y = Math.sin(t * 0.25) * 0.06
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = t * 0.07
    }
  })

  const seg = isMobile ? 32 : 48
  const atmSeg = isMobile ? 20 : 32

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[isMobile ? 0.85 : 1.1, seg, seg]} />
        <meshStandardMaterial
          map={surfaceTex}
          roughness={0.7}
          metalness={0.08}
          emissive="#081530"
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[isMobile ? 0.85 : 1.1, seg, seg]} />
        <meshStandardMaterial map={cloudTex} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* Three layered atmosphere shells — warm inner scatter, cool outer fade */}
      <mesh scale={1.03}>
        <sphereGeometry args={[isMobile ? 0.85 : 1.1, atmSeg, atmSeg]} />
        <meshBasicMaterial
          color="#8fc4ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[isMobile ? 0.85 : 1.1, atmSeg, atmSeg]} />
        <meshBasicMaterial
          color="#4a8eef"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[isMobile ? 0.85 : 1.1, atmSeg, atmSeg]} />
        <meshBasicMaterial
          color="#1a3d6e"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────────
   Orbiting body
───────────────────────────────────────────── */
function OrbitBody({
  radius, speed, size, label, currentP, appearAt, isMobile,
}: {
  radius: number
  speed: number
  size: number
  colorBase: [number, number, number]
  colorHighlight: [number, number, number]
  label: string
  currentP: React.MutableRefObject<number>
  appearAt: number
  variant: 'rocky' | 'banded' | 'cratered' | 'icy'
  isMobile: boolean
}) {
  const orbitGroupRef = useRef<THREE.Group>(null)
  const bodyRef       = useRef<THREE.Mesh>(null)
  const materialRef   = useRef<THREE.MeshStandardMaterial>(null)
  const labelRef      = useRef<THREE.Sprite>(null)

  const startAngle  = useMemo(() => Math.random() * Math.PI * 2, [])
  const inclination = useMemo(() => (Math.random() - 0.5) * 0.10, [])

  const tex = useLoader(THREE.TextureLoader, '/textures/sentiquant-moon-texture.jpg')

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS      = THREE.RepeatWrapping
  }, [tex])

  // FIX 2 — dimmer label fill so bloom doesn't over-glow text
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 80
    const ctx = canvas.getContext('2d')!
    ctx.font = '700 32px Inter, sans-serif'
    ctx.fillStyle = '#c5d6ea'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 160, 40)
    return new THREE.CanvasTexture(canvas)
  }, [label])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const p = currentP.current

    if (orbitGroupRef.current) {
      const speedWobble = 1 + Math.sin(t * 0.15 + startAngle) * 0.08
      orbitGroupRef.current.rotation.y = startAngle + t * speed * speedWobble
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y = t * speed * 2
    }

    const localP = THREE.MathUtils.clamp((p - appearAt) / 0.25, 0, 1)
    if (materialRef.current) {
      materialRef.current.opacity = localP
    }
    if (labelRef.current) {
      // FIX 2 — reduced max opacity so labels stay crisp not glowing
      ;(labelRef.current.material as THREE.SpriteMaterial).opacity = localP * 0.75
      labelRef.current.position.y = size + 0.35
    }
  })

  return (
    <group rotation={[inclination, 0, 0]}>
      <group ref={orbitGroupRef}>
        <group position={[radius, 0, 0]}>
          <mesh ref={bodyRef}>
            <sphereGeometry args={[size, isMobile ? 16 : 24, isMobile ? 16 : 24]} />
            <meshStandardMaterial
              ref={materialRef}
              map={tex}
              roughness={0.95}
              metalness={0.02}
              emissive="#15171c"
              emissiveIntensity={0.25}
              transparent
              opacity={0}
            />
          </mesh>
          <sprite ref={labelRef} scale={[0.9, 0.22, 1]}>
            <spriteMaterial map={labelTexture} transparent opacity={0} depthWrite={false} />
          </sprite>
        </group>

        {/* Double-ring: bright core + soft glow halo */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.003, radius + 0.003, isMobile ? 64 : 120]} />
          <meshBasicMaterial
            color="#5b9eef"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.01, radius + 0.01, isMobile ? 64 : 120]} />
          <meshBasicMaterial
            color="#2a5da8"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ─────────────────────────────────────────────
   Central label "SENTIQUANT"
───────────────────────────────────────────── */
function CentralLabel({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Sprite>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const ctx = canvas.getContext('2d')!
    ctx.font = '600 40px Inter, sans-serif'
    // FIX 2 — off-white so bloom doesn't over-flare the text
    ctx.fillStyle = '#d8e4f2'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SENTIQUANT', 256, 48)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(() => {
    if (ref.current) {
      // FIX 2 — slightly lower ceiling opacity for restraint
      ;(ref.current.material as THREE.SpriteMaterial).opacity = 0.85
    }
  })

  return (
    <sprite
      ref={ref}
      position={[0, isMobile ? 1.95 : 1.65, 0]}
      scale={isMobile ? [1.6, 0.3, 1] : [2.0, 0.38, 1]}
    >
      <spriteMaterial map={texture} transparent opacity={0} depthWrite={false} />
    </sprite>
  )
}

/* ─────────────────────────────────────────────
   Distant sun sphere caught by Bloom for a visible light source
───────────────────────────────────────────── */
function DistantSun() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.9
    }
  })
  return (
    <mesh ref={ref} position={[14, 5, 9]}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial color="#fff4dd" transparent opacity={0} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────
   Scene — camera dolly driven by scroll state
───────────────────────────────────────────── */
function Scene({
  targetState, stateProgress, isMobile,
}: {
  targetState: React.MutableRefObject<number>
  stateProgress: React.MutableRefObject<number>
  isMobile: boolean
}) {
  const currentP = useRef(0)

  useFrame(({ camera }) => {
    const targetP = Math.min(1, Math.max(0, targetState.current / 3))
    currentP.current = THREE.MathUtils.lerp(
      currentP.current,
      targetP,
      0.06 + stateProgress.current * 0.1
    )
    const p = currentP.current

    const baseZ  = isMobile ? 7.5 : 3.2
    const zRange = isMobile ? 5.5 : 5.8
    const baseY  = isMobile ? 0.5 : 0.9
    const yRange = isMobile ? 1.0 : 1.2

    const targetZ = baseZ + p * zRange
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseY + p * yRange, 0.08)
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <CentralPlanet isMobile={isMobile} />
      <CentralLabel isMobile={isMobile} />
      <DistantSun />

      {/* FIX 1 — each planet gets a distinct visual variant + conditional ring */}
      <OrbitBody
        radius={isMobile ? 2.4 : 2.6}
        speed={0.07}
        size={0.32}
        colorBase={[150, 110, 40]}
        colorHighlight={[230, 190, 110]}
        label="Fundamental"
        currentP={currentP}
        appearAt={0.15}
        variant="cratered"
        isMobile={isMobile}
      />
      <OrbitBody
        radius={isMobile ? 3.3 : 3.4}
        speed={0.055}
        size={0.28}
        colorBase={[40, 130, 110]}
        colorHighlight={[110, 220, 190]}
        label="Technical"
        currentP={currentP}
        appearAt={0.35}
        variant="banded"
        isMobile={isMobile}
      />
      <OrbitBody
        radius={isMobile ? 4.1 : 4.2}
        speed={0.04}
        size={0.3}
        colorBase={[140, 50, 100]}
        colorHighlight={[230, 120, 180]}
        label="Sentiment"
        currentP={currentP}
        appearAt={0.55}
        variant="icy"
        isMobile={isMobile}
      />
      <OrbitBody
        radius={isMobile ? 4.9 : 5.0}
        speed={0.03}
        size={0.26}
        colorBase={[70, 70, 140]}
        colorHighlight={[150, 150, 230]}
        label="MDA Report"
        currentP={currentP}
        appearAt={0.7}
        variant="rocky"
        isMobile={isMobile}
      />

      {/* 3-point lighting: lower ambient for deeper shadow, stronger key */}
      <ambientLight intensity={0.14} />
      <directionalLight position={[7, 3, 5]} intensity={2.4} color="#fff4e0" />
      <pointLight position={[-4, 1, 3]} intensity={0.6} color="#5b9eef" />
      <pointLight position={[-7, -2, -5]} intensity={0.35} color="#0d2347" />
    </>
  )
}

/* ─────────────────────────────────────────────
   Export
───────────────────────────────────────────── */
export function SolarSystemScene({
  targetState, stateProgress,
}: {
  targetState: React.MutableRefObject<number>
  stateProgress: React.MutableRefObject<number>
}) {
  // PART 2 — mobile GPU budget: lower DPR, fewer stars, no mipmapBlur
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  return (
    <div style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}>
      <Canvas
        camera={{
          position: [0, isMobile ? 0.5 : 0.4, isMobile ? 7.5 : 3.2],
          fov: isMobile ? 62 : 50,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        frameloop="always"
        style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
      >
        <color attach="background" args={['#000000']} />
        <Stars radius={80} depth={50} count={isMobile ? 1200 : 3000} factor={3} saturation={0} fade speed={0.5} />
        <Suspense fallback={null}>
          <Scene targetState={targetState} stateProgress={stateProgress} isMobile={isMobile} />
        </Suspense>
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.4}
            mipmapBlur={!isMobile}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
