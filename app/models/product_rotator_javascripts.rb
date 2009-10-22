module ProductRotatorJavascripts
  def self.included(base)
    base.class_eval {
      before_filter :require_necessary_javascript_files
      include InstanceMethods
    }
  end

  module InstanceMethods
    def require_necessary_javascript_files
      include_javascript 'admin/prototype.js'
      include_javascript 'admin/effects.js'
      include_javascript 'admin/glider.js'
    end
  end
end