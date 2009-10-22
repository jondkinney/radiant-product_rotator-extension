# Uncomment this if you reference any of your controllers in activate
# require_dependency 'application_controller'

class ProductRotatorExtension < Radiant::Extension
  version "1.0"
  description "Rotate some product images with jQuery on the home page"
  url "http://jonkinney.com"
  
  define_routes do |map|
    map.namespace :admin, :member => { :remove => :get } do |admin|
      admin.resources :products
    end
  end
  
  def activate
    admin.nav[:content] << admin.nav_item(:product_rotator, "Product Rotator", "/admin/products")
    Page.send :include, ProductRotatorTags
  end
end
