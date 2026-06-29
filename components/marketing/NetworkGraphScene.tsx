'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// NODE_COUNT moved inside NetworkGraph as mobile-responsive state (PART 5)
const CONNECTION_DISTANCE = 1.6
const SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC', 'SBIN', 'BHARTIARTL',
  'WIPRO', 'AXISBANK', 'MARUTI', 'TATAMOTORS', 'SUNPHARMA',
]

interface NodeData {
  position: THREE.Vector3
  velocity: THREE.Vector3
  basePosition: THREE.Vector3
  symbolIndex: number
}

function NetworkGraph() {
  const pointsRef  = useRef<THREE.Points>(null)
  const linesRef   = useRef<THREE.LineSegments>(null)
  const pulseRef   = useRef<THREE.Points>(null)
  const mouseWorld = useRef(new THREE.Vector3(999, 999, 0))
  const { camera } = useThree()

  // PART 5 — mobile-responsive node/pulse counts; initializer runs once on mount
  const [nodeCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 28 : 60
  )
  const [pulseCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 14
  )
  // PART 3 — mobile node distribution (narrower X, taller Y for portrait viewports)
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  )

  const nodes = useMemo<NodeData[]>(() => {
    const arr: NodeData[] = []
    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * (isMobile ? 3.5 : 7),
        (Math.random() - 0.5) * (isMobile ? 6 : 4),
        (Math.random() - 0.5) * 2
      )
      arr.push({
        position:     pos.clone(),
        velocity:     new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.02
        ),
        basePosition: pos.clone(),
        symbolIndex:  i % 5 === 0 ? Math.floor(Math.random() * SYMBOLS.length) : -1,
      })
    }
    return arr
  }, [nodeCount, isMobile])

  const nodePositions = useMemo(() => new Float32Array(nodeCount * 3), [nodeCount])
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
    return g
  }, [nodePositions])

  const MAX_CONNECTIONS = nodeCount * 8
  const linePositions = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), [MAX_CONNECTIONS])
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    g.setDrawRange(0, 0)
    return g
  }, [linePositions])

  const pulseData = useMemo(() =>
    Array.from({ length: pulseCount }, () => ({
      fromIdx:  Math.floor(Math.random() * nodeCount),
      toIdx:    Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed:    0.3 + Math.random() * 0.4,
    })),
  [pulseCount, nodeCount])

  const pulsePositions = useMemo(() => new Float32Array(pulseCount * 3), [pulseCount])
  const pulseGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))
    return g
  }, [pulsePositions])

  // PART 4 — merge touchmove handler alongside mousemove for mobile repulsion
  useEffect(() => {
    function project(clientX: number, clientY: number) {
      const ndcX = (clientX / window.innerWidth) * 2 - 1
      const ndcY = -(clientY / window.innerHeight) * 2 + 1
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5)
      vec.unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const dist = -camera.position.z / dir.z
      mouseWorld.current.copy(camera.position).addScaledVector(dir, dist)
    }

    function handleMove(e: MouseEvent) {
      project(e.clientX, e.clientY)
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) project(e.touches[0].clientX, e.touches[0].clientY)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [camera])

  useFrame(() => {
    // Update nodes
    for (let i = 0; i < nodeCount; i++) {
      const n = nodes[i]

      const dx = n.position.x - mouseWorld.current.x
      const dy = n.position.y - mouseWorld.current.y
      const dz = n.position.z - mouseWorld.current.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < 1.4 && dist > 0.001) {
        const force = (1.4 - dist) * 0.012 / dist
        n.velocity.x += dx * force
        n.velocity.y += dy * force
        n.velocity.z += dz * force
      }

      n.velocity.x += (n.basePosition.x - n.position.x) * 0.0015
      n.velocity.y += (n.basePosition.y - n.position.y) * 0.0015
      n.velocity.z += (n.basePosition.z - n.position.z) * 0.0015

      n.velocity.multiplyScalar(0.96)
      n.position.add(n.velocity)

      nodePositions[i * 3]     = n.position.x
      nodePositions[i * 3 + 1] = n.position.y
      nodePositions[i * 3 + 2] = n.position.z
    }
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Rebuild connections
    let lineIdx = 0
    for (let i = 0; i < nodeCount && lineIdx < MAX_CONNECTIONS; i++) {
      for (let j = i + 1; j < nodeCount && lineIdx < MAX_CONNECTIONS; j++) {
        const dx = nodes[i].position.x - nodes[j].position.x
        const dy = nodes[i].position.y - nodes[j].position.y
        const dz = nodes[i].position.z - nodes[j].position.z
        if (dx * dx + dy * dy + dz * dz < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
          linePositions[lineIdx * 6]     = nodes[i].position.x
          linePositions[lineIdx * 6 + 1] = nodes[i].position.y
          linePositions[lineIdx * 6 + 2] = nodes[i].position.z
          linePositions[lineIdx * 6 + 3] = nodes[j].position.x
          linePositions[lineIdx * 6 + 4] = nodes[j].position.y
          linePositions[lineIdx * 6 + 5] = nodes[j].position.z
          lineIdx++
        }
      }
    }
    if (linesRef.current) {
      linesRef.current.geometry.attributes.position.needsUpdate = true
      linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    }

    // Animate pulses
    pulseData.forEach((p, idx) => {
      p.progress += p.speed * 0.016
      if (p.progress >= 1) {
        p.progress = 0
        p.fromIdx = Math.floor(Math.random() * nodeCount)
        p.toIdx   = Math.floor(Math.random() * nodeCount)
      }
      const from = nodes[p.fromIdx].position
      const to   = nodes[p.toIdx].position
      pulsePositions[idx * 3]     = from.x + (to.x - from.x) * p.progress
      pulsePositions[idx * 3 + 1] = from.y + (to.y - from.y) * p.progress
      pulsePositions[idx * 3 + 2] = from.z + (to.z - from.z) * p.progress
    })
    if (pulseRef.current) {
      pulseRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      <points ref={pointsRef} geometry={nodeGeo}>
        <pointsMaterial
          size={0.05}
          color="#6fa8e0"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial
          color="#2a5da8"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={pulseRef} geometry={pulseGeo}>
        <pointsMaterial
          size={0.09}
          color="#9fd8ff"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {nodes
        .filter(n => n.symbolIndex >= 0)
        .slice(0, 6)
        .map((n, i) => (
          <SymbolLabel key={i} node={n} text={SYMBOLS[n.symbolIndex]} />
        ))}
    </group>
  )
}

function SymbolLabel({ node, text }: { node: NodeData; text: string }) {
  const ref = useRef<THREE.Sprite>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 56
    const ctx = canvas.getContext('2d')!
    ctx.font = '600 26px Inter, sans-serif'
    ctx.fillStyle = '#aac8e8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 28)
    return new THREE.CanvasTexture(canvas)
  }, [text])

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(
        node.position.x,
        node.position.y + 0.18,
        node.position.z
      )
    }
  })

  return (
    <sprite ref={ref} scale={[0.7, 0.16, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.55} depthWrite={false} />
    </sprite>
  )
}

export function NetworkGraphScene() {
  // PART 3 — pull camera back on mobile for taller/narrower node spread
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  const [isVisible, setIsVisible] = useState(true)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = canvasWrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={canvasWrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [0, 0, isMobile ? 7.5 : 6],
          fov: isMobile ? 60 : 50,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />
        <NetworkGraph />
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
