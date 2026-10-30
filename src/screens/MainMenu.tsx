import { motion } from 'framer-motion'
import { Rocket, Play, RotateCcw } from 'lucide-react'

interface Props {
  hasSave: boolean
  onNewGame: () => void
  onContinue: () => void
}

export function MainMenu({ hasSave, onNewGame, onContinue }: Props) {
  return (
    <div
      className="min-h-full flex flex-col items-center justify-center px-6"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <Rocket size={56} className="mx-auto text-teal-300 mb-6" strokeWidth={1.5} />
        <h1 className="font-serif text-5xl sm:text-6xl text-white tracking-wide leading-tight">
          Звёздный<br />
          <span className="text-teal-300">Странник</span>
        </h1>
        <p className="mt-4 text-sm tracking-[0.3em] text-white/40 uppercase">
          Книга-игра · RPG
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-xs space-y-3"
      >
        <MenuButton onClick={onNewGame} icon={<Play size={18} />} primary>
          Новая игра
        </MenuButton>

        {hasSave && (
          <MenuButton onClick={onContinue} icon={<RotateCcw size={18} />}>
            Продолжить
          </MenuButton>
        )}
      </motion.div>

      <p className="mt-12 text-xs text-white/20 text-center max-w-xs leading-relaxed">
        Ты — капитан «Звёздного Странника»,<br />
        затянутого в неизвестную вселенную.<br />
        Найди путь домой.
      </p>
    </div>
  )
}

function MenuButton({
  children,
  onClick,
  icon,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  icon: React.ReactNode
  primary?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={
        primary
          ? 'w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-200 px-5 py-3.5 hover:bg-teal-400/25 transition-colors font-medium'
          : 'w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/80 px-5 py-3.5 hover:bg-white/10 transition-colors'
      }
    >
      {icon}
      {children}
    </motion.button>
  )
}