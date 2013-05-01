# We're in development mode
ENV['RAILS_ENV'] ||= 'development'

# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Ensemble::Application.initialize!
