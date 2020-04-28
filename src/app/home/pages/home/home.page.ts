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
        this.dbService.getAllSongs().then(async (songs: Song[]) => {
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
    console.log(this.songFormGroup.value);
  }
}
