import React, { Component } from "react";

import request from "superagent";

import { NewBeachbreakForm } from "./components/NewBeachbreakForm";
import { Beachbreak } from "./models/beachbreak";
import { BeachbreakList } from "./components/BeachbreakList";
import { Map } from "./components/Map";

import { baseUrl, locationIqUrl } from "./constants";
import "./App.css";

interface State {
  newBeachbreak: Beachbreak;
  beachbreaks: Beachbreak[];
  latitude: string;
  longitude: string;
  searchBeachInput: string;
}


class App extends Component<{}, State> {
  state = {
    newBeachbreak: {
      name: "",
      latitude: "",
      longitude: ""
    },
    beachbreaks: [],
    latitude: "",
    longitude: "",
    searchBeachInput: ""
  };

  // mockData = [
  //   {
  //     id: 1,
  //     name: "Figueira da Foz",
  //     latitude: "38.916",
  //     longitude: "-9.908",
  //     waveheightvalue: 1.02,
  //     swellperiodvalue: 2,
  //     windspeedvalue: 2.6,
  //     winddirectionvalue: 340

  //   },
  //   {
  //     id: 2,
  //     name: "Peniche",
  //     latitude: "39.433",
  //     longitude: "-9.284",
  //     waveheightvalue: 1.70,
  //     swellperiodvalue: 6,
  //     windspeedvalue: 8.9,
  //     winddirectionvalue: 310
  //   }
  // ]

  componentDidMount() {
    this.getAllBeaches();
  }

  getAllBeaches = () => {
    request
    .get(baseUrl)
    .then(res => this.setState({ beachbreaks: res.body }))
    .catch(e => console.warn(e))
  }

  private addBeachbreak = (event: React.FormEvent<HTMLFormElement>) => {
    const index = this.state.beachbreaks.length - 1;
    const lastBeach: any = this.state.beachbreaks[index];

    event.preventDefault();

    request
      .get(`${locationIqUrl}key=9a3ffea2532108&q=${this.state.searchBeachInput}&format=json`)
      .accept("application/json")
      .then(res => {
        const [firstHit] = res.body;

        this.setState({
          newBeachbreak: {
            id: lastBeach.id + 1,
            name: firstHit.display_name.split(",")[0],
            latitude: firstHit.lat,
            longitude: firstHit.lon
          }
        })

        request
          .post(baseUrl)
          .send(this.state.newBeachbreak)
          .then(() => this.getAllBeaches())
          .catch(e => console.warn(e));
      })
      .catch(e => console.warn(e))

  };

  private handleBeachbreakChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchBeachInput: event.target.value
    })
  };

  private deleteBeachbreak = (beachbreakToDelete: Beachbreak) => {
    request
      .delete(`${baseUrl}/${beachbreakToDelete.id}`)
      .then(() => this.setState(previousState => ({
        beachbreaks: [
          ...previousState.beachbreaks.filter(
            beachbreak => beachbreak.id !== beachbreakToDelete.id
          )
        ]
      })))
      .catch(e => console.warn(e))
  };

  render() {
    const { newBeachbreak, beachbreaks } = this.state;

    return (

      <div className="App">
        <h2 className="title">Surf forecast</h2>

        <NewBeachbreakForm
          beachbreak={newBeachbreak}
          onAdd={this.addBeachbreak}
          onChange={this.handleBeachbreakChange}

        />
        {beachbreaks && <BeachbreakList
          beachbreaks={beachbreaks}
          onDelete={this.deleteBeachbreak}
        />}

        <Map />
      </div>
    );
  }
}

export default App;
