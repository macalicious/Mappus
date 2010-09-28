require 'rake'



desc "Take care of normal hygeine tasks."
task :convert, [:file] do |t, arg|
  puts arg.file.inspect
end

rule ".peniz", [:file] do |t,arg|
  puts "jajaja"
  puts arg.inspect
end

def convert(file, x) 
  puts file.inspect
  puts x.inspect
end

rule '.json' => ['.csv'] do |t|
  convert t.source, :to => 'json'
end

rule '.xml' => ['.csv'] do |t|
  convert t.source, :to => 'xml'
end