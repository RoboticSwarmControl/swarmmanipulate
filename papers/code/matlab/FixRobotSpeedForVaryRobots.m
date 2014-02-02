
% top speed as we vary # of robots changes.  Must fix this
% # robots, ss to cross screen (furthest right robot to right)
data = [
125, 7
301, 12.5 
35 6 
114 7
27 5 
258, 11
477, 20];
plot(data(:,1),data(:,2).*.032./data(:,1),'.')
xlabel('#robots')
ylabel('time')