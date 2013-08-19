class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :check_task_sig

  def check_task_sig
  	unless  cookies["task_sig"]
  		cookies["task_sig"] = SecureRandom.urlsafe_base64
  	end
  end
end
