/* Projeto feito com ♥ por Leonardo Meliande */

import './App.css';
import React, { Component, useState, useLayoutEffect  } from 'react'
import ReactDOM from "react-dom";
import Header from './components/Header'
import Chart from './components/Chart'
//import { Button, Container, Row, Col, FormTextarea } from "shards-react";
import { Grid, Button, TextField } from '@material-ui/core'
import Editor from '@monaco-editor/react';


import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

import {
	ReflexContainer,
	ReflexSplitter,
	ReflexElement
} from 'react-reflex';

import 'react-reflex/styles.css';

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			chartData: {},
			jsonInput: `{"type": "start", "timestamp": 1519862400000, "select": ["min_response_time", "max_response_time"], "group": ["os", "browser"]}\n{type: 'span', timestamp: 1519862400000, begin: 1519862400000, end: 1529862400000}\n{type: 'data', timestamp: 1519862400000, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}\n{type: 'data', timestamp: 1519862460000, os: 'linux', browser: 'chrome', min_response_time: 0.4, max_response_time: 1.3}\n{type: 'data', timestamp: 1519862520000, os: 'linux', browser: 'chrome', min_response_time: 0.7, max_response_time: 0.6}\n{type: 'data', timestamp: 1519862400000, os: 'mac', browser: 'chrome', min_response_time: 0.7, max_response_time: 1.7}\n{type: 'data', timestamp: 1519862460000, os: 'mac', browser: 'chrome', min_response_time: 0.5, max_response_time: 0.9}\n{type: 'data', timestamp: 1519862520000, os: 'mac', browser: 'chrome', min_response_time: 0.8, max_response_time: 2.0}\n{type: 'stop', timestamp: 1519862520000}`,
			eventsArray: [],
			width: 300,
            height: 300,
		};

		this.convertString = this.convertString.bind(this)
        this.fitToParentSize = this.fitToParentSize.bind(this)
	}

	componentDidMount () {
		window.addEventListener('resize', this.fitToParentSize)
        this.fitToParentSize()
	}

	componentWillUnmount() {  
		window.removeEventListener('resize', this.fitToParentSize) 
	}

	//The next three methods are used to convert the string input into an array of objects that represent the chart data
	trimString(string) {
		return string.trim();
	}

	filterResult(string) {
		return string.length > 0;
	}
	
	convertString() {
		var array = this.state.jsonInput.split("\n").map(this.trimString).filter(this.filterResult);
		for (var i = 0; i < array.length; i++) {
			array[i] = array[i];
			array[i] = JSON.stringify(eval("(" + array[i] + ")"));
			array[i] = JSON.parse(array[i])
		}

		this.setState({ eventsArray: array }, () => {
			this.createData(); //After the array of objects of events has been added to the state then we can used it to create the actual data for the chart
		});
	}

	updateChart = _ => {
		this.getChartData(); //Initialize the chartData object
		this.convertString(); //Convert the string input into an array of objects that represent the chart data
	}

	//Create a random RGBA color
	random_rgba() {
		var o = Math.round, r = Math.random, s = 255;
		return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 1 + ')';
	}

	//Create a new dataset for the chart
	createDataset(label, data) {
		var random = this.random_rgba();
		var dataset = {
			label: label,
			fill: false,
			pointHoverBackgroundColor: random,
			borderColor: random,
			lineTension: 0,
			showLine: true,
			data: data,
			backgroundColor: [
				random
			]
		};

		return dataset;
	}

	createData() {

		var label = "";
		var data = {};
		var dataArray = [];
		var dataset = {};
		var chartDataArray = [];
		var datasetIsOriginal = true;

		var selects = [];
		var groups = [];
		var start = false;

		var begin = -1;
		var end = -1;

		var chartTemp = {};

		for (var i = 0; i < this.state.eventsArray.length; i++) { //Loop trough all events objects in the events array

			if (this.state.eventsArray[i].type === 'start') {
				start = true;
				selects = this.state.eventsArray[i].select; //Update list of selects received by event of type 'start'
				groups = this.state.eventsArray[i].group; //Update list of groups received by event of type 'start'
			} else if (this.state.eventsArray[i].type === 'data' && start === true) {

				//The data event sent has to be between the times set by the span event in order to appear on the chart
				if ((begin === -1 || this.state.eventsArray[i].timestamp >= begin) && (end === -1 || this.state.eventsArray[i].timestamp <= end)) {

					for (var k = 0; k < selects.length; k++) { //Loop trough all the selects

						datasetIsOriginal = true;
						label = "";
						dataArray = [];
						for (var n = 0; n < groups.length; n++) { //Loop trough all the groups
							label = label + " " + this.state.eventsArray[i][groups[n]];
						}

						label = label + " " + selects[k];
						data = { x: this.state.eventsArray[i].timestamp, y: this.state.eventsArray[i][selects[k]] };
						dataArray.push(data);

						for (var j = 0; j < chartDataArray.length; j++) {
							if (chartDataArray[j].label === label) { //If a dataset with the same label already exists we simply add the new data to the existing dataset
								chartDataArray[j].data.push(data);
								datasetIsOriginal = false;
							}
						}
						if (datasetIsOriginal === true) { //If a dataset with the same label doesn't exists we create a new dataset with the new data
							dataset = this.createDataset(label, dataArray); //Create a new dataset for the chart
							chartDataArray.push(dataset); //Add the new dataset to the ChartData array
						}
					}
				}
			} else if (this.state.eventsArray[i].type === 'stop') {
				start = false;
			} else if (this.state.eventsArray[i].type === 'span' && start === true) {
				begin = this.state.eventsArray[i].begin; //If the event is of type span we update the beggining and ending values of time to display the data
				end = this.state.eventsArray[i].end;
			}
		}

		//Update the dataset property of the chartData state with the new data that was constructed from the user input
		chartTemp = this.state.chartData;
		chartTemp.datasets = chartDataArray;
		this.setState({ chartData: chartTemp });
	}

	//Initialize the chartData object
	getChartData() {
		this.setState({
			chartData: {
				datasets: [

				]
			}
		});
	}

	fitToParentSize(){ // Function that turns the chart responsive
        
        var w = this.refs.bottom.offsetWidth - 20
        var h = this.refs.bottom.offsetHeight - 20
        
        // Changes the width and sets the minimum width
        if (w!== this.state.width){
            if(w < 300){ w = 300} 
        }
        
        
        // Changes the height and sets the minimum height
        if (h !== this.state.height){
            if(h < 300){ h = 300} 
        }
        
        this.setState({ width: w, height: h})
        
    }   // Function that turns the chart responsive

	render() {
		return (
			<div className="App">

				<Grid className={'top-pane'} spacing={0}>
					<header >
						<Header />
					</header>

					<SplitterLayout className={'splitted_pane'} 
						vertical primaryMinSize={100} 
						secondaryMinSize={300} 
						onDragEnd={this.fitToParentSize}
					>
						<div className="input">
							<Editor 
								height = {280} 
								language = "json" 
								theme = "dark" 
								value = {this.state.jsonInput} 
								onChange = {e => this.setState({ jsonInput: e.target.value })} 
							/>
						</div>

						<div className="bottom-pane" ref="bottom" style={{ paddingTop: 20 }}>
							<Chart 
								width={this.state.width} 
								height={this.state.height}  
								chartData={this.state.chartData} 
							/>
							<div>
								<Button variant='contained' color='#00CC7A' style={{ paddingTop: 5 }}
									onClick={this.updateChart}>
										GENERATE CHART
								</Button>
							</div>
						</div>
					</SplitterLayout>
				</Grid>

			</div>
			
		);
	}
}

export default App;
