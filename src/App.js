import React, {useState, useEffect} from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from './InfoBox';
import MapUI from "./MapUI";
import Table from "./Table";
import './App.css';
import {prettyPrintStat, sortData} from "./util";
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 25.0, lng: 11.0 });
  const [mapZoom, setMapZoom] = useState(4);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        let sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }
    getCountriesData();
  }, []);
  
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    setCountry(countryCode);

    const url =
      countryCode === "worldwide"
      ? "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
      await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  }

  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>COVID-19 Monitoring System</h1>
      <FormControl className="app__dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country) => (
            <MenuItem value={country.value}>{country.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>

      <div className="app__stats">
        <InfoBox
            title="COVID Cases"
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            total={prettyPrintStat(countryInfo.cases)}/>
        <InfoBox
            title="Recovered"
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            total={prettyPrintStat(countryInfo.recovered)}/>
        <InfoBox
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            total={prettyPrintStat(countryInfo.deaths)}/>
      </div>
      
      <MapUI countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom}/>

    </div>
    <Card className="app__right">
      <CardContent>
        <h3>Live Cases by Country</h3>
        <Table countries={tableData}/>
      </CardContent>
    </Card>
    </div>
  );
}

export default App;
