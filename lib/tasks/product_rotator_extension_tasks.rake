namespace :radiant do
  namespace :extensions do
    namespace :product_rotator do
      
      desc "Runs the migration of the Product Rotator extension"
      task :migrate => :environment do
        require 'radiant/extension_migrator'
        if ENV["VERSION"]
          ProductRotatorExtension.migrator.migrate(ENV["VERSION"].to_i)
        else
          ProductRotatorExtension.migrator.migrate
        end
      end
      
      desc "Copies public assets of the Product Rotator to the instance public/ directory."
      task :update => :environment do
        is_svn_or_dir = proc {|path| path =~ /\.svn/ || File.directory?(path) }
        puts "Copying assets from ProductRotatorExtension"
        Dir[ProductRotatorExtension.root + "/public/**/*"].reject(&is_svn_or_dir).each do |file|
          path = file.sub(ProductRotatorExtension.root, '')
          directory = File.dirname(path)
          mkdir_p RAILS_ROOT + directory, :verbose => false
          cp file, RAILS_ROOT + path, :verbose => false
        end
      end  
    end
  end
end
