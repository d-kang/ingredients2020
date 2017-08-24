import React, { Component } from 'react';
import '../App.css';
import { bindAll } from 'lodash';
import $ from 'jquery';
import { Button } from 'react-bootstrap';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      searchResName: '',
      searchResLink: '',
      currentFlagged: [],
      data_uri: null,
      processing: false,
      passed: '',
      pastSearches: [],
      username: localStorage.getItem('username')
    };

    bindAll(this, 'renderPastSearches', 'handleFile', 'handleSearch', 'handleSubmit', 'searchDb', 'renderSearch', 'logout', 'isAuthenticated');
  }

  logout() {
    this.props.auth.logout();
    this.props.history.push('/');
  }

  renderPastSearches() {
    var data = {
      username: this.state.username
    }
    //here we need to create a get method to populate pastSearches array

    $.post('/api/pastSearches', {
      data: data
    })
    .done((items) => {
      //on sucess we set the new state
      var totalIngredients = items.reduce(function(total, el){
        return total.concat(el);
      }, []);
      this.setState({
        pastSearches: totalIngredients
      });
    })
    .fail(() => {
      console.log('failed getting items');
    });

  }

  handleSearch(event) {
    this.setState({
      search: event.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const _this = this;
    _this.setState({
      search: '',
      searchResName: '',
      searchResLink: '',
      currentFlagged: [],
      processing: false,
      passed: '',
      pastSearches: [],
    })
    var data = {
      data_uri: this.state.data_uri,
      filename: this.state.filename,
      filetype: this.state.filetype,
      username: this.state.username
    }

    $.ajax({
      url: '/api/image',
      type: 'POST',
      data: data,
      dataType: 'json'
    })
    .done(function(data){
      console.log(data);
      if(data.slice(1).length === 0){
        _this.setState({
          passed: 'No Flagged Ingredients, feel free to gobble this up!'
        })
      }
      _this.setState({
        currentFlagged: data
      });
    })
  }

  handleFile(e) {
    this.setState({
      search: '',
      searchResName: '',
      searchResLink: '',
      currentFlagged: [],
      processing: false,
      passed: '',
      pastSearches: [],
    })
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onload = (upload) => {
      this.setState({
        data_uri: upload.target.result,
        filename: file.name,
        filetype: file.type
      });
    };

    reader.readAsDataURL(file);
  }

  renderSearch(searchResName, link) {

    this.setState({
      searchResName: searchResName,
      searchResLink: link || ''
    });
  }

  searchDb(e) {
    e.preventDefault();
    this.setState({
      search: '',
      searchResName: '',
      searchResLink: '',
      currentFlagged: [],
      data_uri: null,
      processing: false,
      passed: '',
      pastSearches: [],
    })
    var lowerCaseSearch = this.state.search.toLowerCase();
    var username = this.state.username;

    var data = {
      ingredient: lowerCaseSearch,
      username: username
    }

    $.post('/api/ingredients', {
      data: data
    })
    .done((obj) => {
      this.renderSearch(obj.name, obj.link);
    })
    .fail((obj) => {
      this.renderSearch(obj.responseText);
    })

  }

  isAuthenticated() {
    return !this.props.auth
      ? <h1>Please log in to gain access to this page</h1>
      :  (
          <div className="Dashboard-btns">
            <button className="Logout-btn" onClick={this.logout}>LOG OUT</button>
            <h2 className="App-header">Ingredients 20/20</h2>

            {/* renders search for ingredient and submit */}
            <form className="form-control" onSubmit={this.searchDb}>
              <input className="Ingredient-input" type="text" value={this.state.search} placeholder="Search for Ingredient"
                  onChange={this.handleSearch}/>
              <input className="Submit-btn" type="submit" value="Submit"/>
            </form>

            {/* renders select image and submit */}
            <form className="form-control" onSubmit={this.handleSubmit} encType='multipart/form-data'>
              <input className="custom-file-input" type='file' name='image' onChange={this.handleFile} />
              <input className="Submit-btn neg-margin-t" type="submit" value="Submit"/>
            </form>

            <img src={this.state.data_uri} className="Image-size" alt="" />

            <div className="Search-parent">
                {
                  this.state.currentFlagged.map(function(ingredient) {
                    <search className="Search-render" key={ingredient._id}>
                      <h3>{ingredient.name}</h3>
                      <p>{ingredient.link}</p>
                    </search>
                  })
                }
                { this.state.passed && <div>{ this.state.passed }</div> }
            </div>

            {
              this.state.searchResLink
              ? <div>{  this.state.searchResName + ' found in database! - '}
                  <a href={this.state.searchResLink} target="_blank">{this.state.searchResLink }</a>
                </div>
              : <div>{ this.state.searchResName }</div>
            }

            {/*renders my past searches */}
            <div className="Button-parent">
              <Button className="Saved-items" onClick={this.renderPastSearches}>MY PAST SEARCHES</Button>
                {this.state.pastSearches.map(function(ingredient) {<search key={ingredient._id}>{ingredient.name + ' - ' + ingredient.link}<br/></search>})}
            </div>
          </div>
          )
  }

  render() {
    return (
      <div>
        { this.isAuthenticated() }
      </div>
    );
  }
}

export default Dashboard;
