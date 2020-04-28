import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { DbService } from '../../services/db.service';
import { ToastController } from '@ionic/angular';
import * as _ from 'lodash';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  songFormGroup: FormGroup;
  songFormData: any;
  songs: Song[];

  constructor(
    private formBuilder: FormBuilder,
    private dbService: DbService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.songFormData = {
      inputs: [
        { label: 'Artist', formControlName: 'artist', type: 'text' },
        { label: 'Song', formControlName: 'song', type: 'text' },
      ],
    };
    this.generateEmptyForm();
    this.dbService.dbState().subscribe((res) => {
      if (res) {
        this.dbService.fetchSongs().subscribe(async (songs: Song[]) => {
          this.songs = songs;
        });
      }
    });
  }

  generateEmptyForm() {
    this.songFormGroup = this.formBuilder.group({});
    _.forEach(this.songFormData.inputs, (input: any) => {
      this.songFormGroup.addControl(
        input.formControlName,
        new FormControl('', Validators.required)
      );
    });
  }

  addSong() {
    this.dbService
      .addSong({
        songName: this.songFormGroup.value.song,
        artistName: this.songFormGroup.value.artist,
      })
      .then(
        (res) => {
          this.songFormGroup.reset();
        },
        async () => {
          const toast = await this.toast.create({
            duration: 2500,
            message: 'Failed to add Song',
          });

          toast.present();
        }
      );
  }

  deleteSong(e, id: string) {
    if (e) {
      e.stopPropagation();
    }
    this.dbService.deleteSong(id).then(
      async (res) => {
        const toast = await this.toast.create({
          message: 'Song deleted',
          duration: 2500,
        });
        toast.present();
      },
      (error) => console.error(error)
    );
  }

  editSong(e, id: string) {
    if (e) {
      e.stopPropagation();
    }
    console.log('ID:::', id);
  }

  clearAllSongs(e) {
    this.dbService.deleteAllSongs().then(
      () => {},
      async () => {
        const toast = await this.toast.create({
          message: 'Failed to Delete All',
          duration: 2500,
        });
        toast.present();
      }
    );
  }
}
