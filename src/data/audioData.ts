import PauseSound from '../assets/audio/pause.mp3';
import UnpauseSound from '../assets/audio/button_click.mp3';
import ButtonHoverSound from '../assets/audio/button_hover.mp3';
import ButtonClickSound from '../assets/audio/button_click.mp3';
import PlayerHurtSound from '../assets/audio/player_hurt.mp3';
import GameOverSound from '../assets/audio/game_over.mp3';
import MissionCompleteSound from '../assets/audio/mission_complete.mp3';

export const audioData = [
    { name: 'pause', path: PauseSound },
    { name: 'unpause', path: UnpauseSound },
    { name: 'button_hover', path: ButtonHoverSound },
    { name: 'button_click', path: ButtonClickSound },
    { name: 'player_hurt', path: PlayerHurtSound },
    { name: 'game_over', path: GameOverSound },
    { name: 'mission_complete', path: MissionCompleteSound },
]