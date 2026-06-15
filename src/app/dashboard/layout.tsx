import Sidebar from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0D2225',
      position: 'relative',
    }}>
      {/* Animated gradient orbs */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41,66,70,0.25) 0%, transparent 70%)',
          animation: 'orb1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%', right: '-10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(69,47,41,0.2) 0%, transparent 70%)',
          animation: 'orb2 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '40%', left: '40%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(101,81,80,0.08) 0%, transparent 70%)',
          animation: 'orb3 20s ease-in-out infinite',
        }} />
      </div>

      <Sidebar />

      <main style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        zIndex: 1,
        background: 'transparent',
      }}>
        {children}
      </main>

      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 40px) scale(1.1); }
          66% { transform: translate(-30px, 60px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -40px) scale(1.05); }
          66% { transform: translate(40px, -60px) scale(1.1); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.15); }
        }
      `}</style>
    </div>
  )
}