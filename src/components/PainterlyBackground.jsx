import React from 'react'

export default function PainterlyBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Deep twilight base */}
      <div className="absolute inset-0 bg-[#0a0a0c]" />

      {/* Floating watercolor glow washes */}
      <div 
        className="painterly-blob animate-float-1 w-[550px] h-[550px] -top-24 -left-20 bg-gradient-to-tr from-studio-purple via-studio-magenta to-transparent" 
      />
      <div 
        className="painterly-blob animate-float-2 w-[650px] h-[650px] top-[30%] -right-40 bg-gradient-to-br from-studio-cobalt via-studio-violet to-transparent opacity-20" 
      />
      <div 
        className="painterly-blob animate-float-3 w-[500px] h-[500px] -bottom-24 left-[20%] bg-gradient-to-tr from-studio-magenta via-studio-gold to-transparent opacity-15" 
      />

      {/* Subtle canvas grain layer */}
      <div className="absolute inset-0 canvas-grain pointer-events-none opacity-40" />
    </div>
  )
}
