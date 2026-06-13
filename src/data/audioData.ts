import PauseSound from '../assets/audio/pause.mp3';
import UnpauseSound from '../assets/audio/button_click.mp3';
import ButtonHoverSound from '../assets/audio/button_hover.mp3';
import ButtonClickSound from '../assets/audio/button_click.mp3';
import PlayerHurtSound from '../assets/audio/player_hurt.mp3';
import GameOverSound from '../assets/audio/game_over.mp3';
import MissionCompleteSound from '../assets/audio/mission_complete.mp3';
import EnemyDrifterHitSound from '../assets/audio/enemy_drifter_hit.mp3';
import EnemyDrifterDeathSound from '../assets/audio/enemy_drifter_death.mp3';
import EnemySeekerHitSound from '../assets/audio/enemy_seeker_hit.mp3';
import EnemySeekerDeathSound from '../assets/audio/enemy_seeker_death.mp3';

export const audioData = [
    { name: 'pause', path: PauseSound },
    { name: 'unpause', path: UnpauseSound },
    { name: 'button_hover', path: ButtonHoverSound },
    { name: 'button_click', path: ButtonClickSound },
    { name: 'player_hurt', path: PlayerHurtSound },
    { name: 'game_over', path: GameOverSound },
    { name: 'mission_complete', path: MissionCompleteSound },
    // Enemy sounds
    { name: 'enemy_drifter_hit', path: EnemyDrifterHitSound },
    { name: 'enemy_drifter_death', path: EnemyDrifterDeathSound },
    { name: 'enemy_seeker_hit', path: EnemySeekerHitSound },
    { name: 'enemy_seeker_death', path: EnemySeekerDeathSound },
]