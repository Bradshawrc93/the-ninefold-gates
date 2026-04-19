import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add
      .text(width / 2, height / 2, 'Floor 0: Boot', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '32px',
        color: '#e6e6e6',
      })
      .setOrigin(0.5);
  }
}
