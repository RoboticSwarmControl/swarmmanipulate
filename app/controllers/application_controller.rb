class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :check_task_sig

  def check_task_sig
  	unless  cookies["task_sig"]
  		#remember forever!
  		cookies["task_sig"] = {:value => SecureRandom.urlsafe_base64,
		  :expires => 20.years.from_now.utc
		}
  	end
  end
end
