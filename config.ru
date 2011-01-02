require 'rubygems'
require 'bundler'

Bundler.require

require './sinatra'
run MyApp

#MyApp.run! :host => 'localhost', :port => 9000
#run MyApp.new